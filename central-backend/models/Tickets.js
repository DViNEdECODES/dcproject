const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    stand: {
        type: String,
        required: true
    },
    seatNumber: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", null],
        default: null
    }
});

module.exports = mongoose.model("Ticket", TicketSchema);
