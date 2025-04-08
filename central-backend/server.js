const express = require("express");

const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const Ticket = require('./models/Tickets'); // Import Ticket model

const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use(cors()); // Enable CORS for frontend access
app.use('/payment', express.static(path.join(__dirname, 'payment')));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/stadiumtickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("MongoDB connection error:", err));

// Original API endpoints
app.post("/book-ticket", async (req, res) => {
    const { stand, seatNumber, userId } = req.body;

    try {
        // Check if the seat is already booked
        let ticket = await Ticket.findOne({ stand, seatNumber });

        if (!ticket) {
            // If seat doesn't exist, create a new one
            ticket = new Ticket({ stand, seatNumber, bookedBy: userId, isBooked: true });
        } else if (ticket.isBooked) {
            return res.status(400).json({ message: "Seat already booked" });
        } else {
            // If seat exists but not booked, update booking details
            ticket.isBooked = true;
            ticket.bookedBy = userId;
            ticket.paymentStatus = "pending";
        }

        await ticket.save();
        res.status(200).json({ message: "Ticket reserved! Complete payment to confirm.", ticket });
    } catch (error) {
        res.status(500).json({ message: "Error booking ticket", error });
    }
});

app.post("/confirm-payment", async (req, res) => {
    const { stand, seatNumber, userId, paymentSuccess } = req.body;

    try {
        let ticket = await Ticket.findOne({ stand, seatNumber, bookedBy: userId });

        if (!ticket || ticket.paymentStatus === "completed") {
            return res.status(400).json({ message: "Ticket not found or already paid" });
        }

        if (paymentSuccess) {
            ticket.paymentStatus = "completed";
            await ticket.save();
            res.status(200).json({ message: "Payment successful! Ticket confirmed.", ticket });
        } else {
            ticket.isBooked = false; // Release seat if payment fails
            ticket.bookedBy = null;
            ticket.paymentStatus = "failed";
            await ticket.save();
            res.status(400).json({ message: "Payment failed! Seat released." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error confirming payment", error });
    }
});

app.get("/available-seats/:stand", async (req, res) => {
    try {
        const stand = req.params.stand;
        const availableSeats = await Ticket.find({ stand, isBooked: false });
        res.status(200).json(availableSeats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching seats", error });
    }
});

// NEW API endpoints to match frontend requirements

// Get seat status (occupied seats)
app.get("/api/seats/status", async (req, res) => {
    try {
        const { stand } = req.query;
        
        // Find all booked seats for this stand
        const bookedSeats = await Ticket.find({ 
            stand: stand, 
            isBooked: true 
        });
        
        // Extract seat numbers and convert to integers
        const occupiedSeats = bookedSeats.map(ticket => parseInt(ticket.seatNumber));
        
        res.json({
            success: true,
            occupiedSeats
        });
    } catch (error) {
        console.error('Error fetching seat status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch seat status'
        });
    }
});

// Reserve seats endpoint
app.post("/api/seats/reserve", async (req, res) => {
    try {
        const { stand, seatNumbers, userId } = req.body;
        
        // Check if any seats are already booked
        const existingBookings = await Ticket.find({
            stand: stand,
            seatNumber: { $in: seatNumbers.map(String) },
            isBooked: true
        });
        
        if (existingBookings.length > 0) {
            return res.json({
                success: false,
                message: 'Some seats are already booked'
            });
        }
        
        // Create or update tickets for all selected seats
        for (const seatNumber of seatNumbers) {
            let ticket = await Ticket.findOne({ 
                stand, 
                seatNumber: String(seatNumber) 
            });
            
            if (!ticket) {
                ticket = new Ticket({
                    stand,
                    seatNumber: String(seatNumber),
                    isBooked: true,
                    bookedBy: userId,
                    paymentStatus: "pending"
                });
            } else {
                ticket.isBooked = true;
                ticket.bookedBy = userId;
                ticket.paymentStatus = "pending";
            }
            
            await ticket.save();
        }
        
        res.json({
            success: true,
            message: 'Seats reserved successfully'
        });
    } catch (error) {
        console.error('Error reserving seats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reserve seats'
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Central backend running on port ${PORT}`));