const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    stand: String,       // Name of the stand (e.g., Merchant, Divecha)
    seatNumber: String,  // Seat number (e.g., A12, B5)
    isBooked: { type: Boolean, default: false },  // Booking status
    bookedBy: String,    // User ID (can be email or username)
    paymentStatus: { type: String, default: "pending" } // "pending", "completed", "failed"
});

module.exports = mongoose.model("Ticket", TicketSchema);
