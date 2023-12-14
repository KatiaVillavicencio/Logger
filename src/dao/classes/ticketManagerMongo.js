import ticketsModel from "../models/tickets.model.js"

export default class Tickets {
    constructor() {

    }

    get = async () => {
        let tickets = await ticketsModel.find()
        return tickets
    }
    addTicket = async (newticket) => {
        try {
            let result = await ticketsModel.create(newticket);
            return result;
        
        } catch (error) {
            console.error("Error al crearticket:", error);
            return "error";
        }
    }
}