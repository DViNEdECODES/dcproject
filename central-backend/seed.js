const mongoose = require("mongoose");
const Ticket = require("./models/Tickets");

const stands = ["merchant", "divecha", "north", "sachin", "gavaskar"];

const MONGO_URL = "mongodb://localhost:27017/stadiumtickets";

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log("MongoDB Connected");

    // Optional: Clear old data
    await Ticket.deleteMany({});
    console.log("Old tickets deleted");

    // Insert 30 tickets per stand
    const tickets = [];

    stands.forEach(stand => {
        for (let i = 1; i <= 30; i++) {
            tickets.push({
                stand: stand,
                seatNumber: i.toString(),
                isBooked: false,
                bookedBy: null,
                paymentStatus: null
            });
        }
    });

    await Ticket.insertMany(tickets);
    console.log("✅ Tickets seeded successfully!");
    mongoose.disconnect();
})
.catch(err => {
    console.error("MongoDB connection error:", err);
});
