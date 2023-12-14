import {cartModel} from "../models/carts.model.js";
import {productsModel} from '../models/products.model.js'


class CartManager {


    getCarts = async () => {
        try {
            const carts = await cartModel.find().lean();
            return carts;
        } catch (err) {
            console.error('Error al obtener los carritos:', err.message);
            return [];
        }
    };

    //comporba stock//
    getStock = async ({ productos }) => {
        try {
        const stockInfo = {};
        const errors = [];

         for (const producto of productos) {
            // Obtener el producto de la colección de productos
            const productInCollection = await productsModel.findOne({ description: producto.description });

            if (!productInCollection) {
                errors.push({ description: producto.description, error: `El producto no se encuentra en la colección` });
                stockInfo[producto.description] = { status: 'No encontrado en la colección' };
                continue;
            }

            // Validar si hay suficiente stock
            if (productInCollection.stock >= producto.stock) {
                // Restar el stock en la colección de productos
                await productsModel.updateOne(
                    { description: productInCollection.description },
                    { $inc: { stock: -producto.stock } }
                );

                stockInfo[producto.description] = {
                    status: 'Suficiente',
                    availableQuantity: productInCollection.stock - producto.stock,
                    requiredQuantity: producto.stock,
                };
            } else {
                errors.push({ description: producto.description, error: 'Insuficiente' });
                stockInfo[producto.description] = { status: 'Insuficiente' };
            }
        }

        if (errors.length > 0) {
            return { errors, stockInfo };
        }

        return stockInfo;
    } catch (error) {
        console.error("Error al obtener el stock:", error);
        return { error: "Error interno al obtener el stock" };
      }
    };

    getAmount = async ({ productos }) => {
       try {
        let totalAmount = 0;

        // Verifica que 'productos' sea definido y que sea un array
         if (!productos || !Array.isArray(productos)) {
            console.error('La propiedad "productos" no es un array válido.');
            return totalAmount;
        }

            for (const producto of productos) {
            // Supongamos que cada producto tiene un precio y stock definidos
            totalAmount += producto.price * producto.stock;
        }

        return totalAmount;
    } catch (error) {
        console.error("Error al calcular el monto:", error);
        return 0; // O manejar el error de otra manera según tus necesidades
    }
};

    getCartById = async (cartId) => {

        try {
            const cart = await cartModel.findById(cartId)

            return cart;
        } catch (err) {
            console.error('Error al obtener el carrito por ID:', err.message);
            return err;
        }
    };
    

    addCart = async (products) => {
        try {
            let cartData = {};
            if (products && products.length > 0) {
                cartData.products = products;
            }
    
            const cart = await cartModel.create(cartData);
            return cart;
        } catch (err) {
            console.error('Error al crear el carrito:', err.message);
            return err;
        }
    };
    

    addProductInCart = async (cid, obj) => {
        try {
            const filter = { _id: cid, "products._id": obj._id };
            const cart = await cartModel.findById(cid);
            const findProduct = cart.products.some((product) => product._id.toString() === obj._id);
    
            if (findProduct) {
                const update = { $inc: { "products.$.quantity": obj.quantity } };
                await cartModel.updateOne(filter, update);
            } else {
                const update = { $push: { products: { _id: obj._id, quantity: obj.quantity } } };
                await cartModel.updateOne({ _id: cid }, update);
            }
    
            return await cartModel.findById(cid);
        } catch (err) {
            console.error('Error al agregar el producto al carrito:', err.message);
            return err;
        }
    };
    deleteProductInCart = async (cid, products) => {
        try {
            return await cartModel.findOneAndUpdate(
                { _id: cid },
                { products },
                { new: true })

        } catch (err) {
            return err
        }

    }
    updateOneProduct = async (cid, products) => {
        
        await cartModel.updateOne(
            { _id: cid },
            {products})
        return await cartModel.findOne({ _id: cid })
    }


};


export default CartManager;