const express = require("express");
const dotEnv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const dbConfig = require("./dbConfig.js");
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotEnv.config();
const app = express();
dbConfig.connectDb();

const userRoutes = require("./routes/user.route.js");
const movieRoutes = require("./routes/movie.route.js");
const theatreRoutes = require("./routes/theatre.route.js");
const showRoutes = require("./routes/show.route.js");
const bookingRoutes = require("./routes/booking.route.js");
const aiRoutes = require("./routes/ai.route.js");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"])


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests, please try again later.",
})

app.use(limiter);
app.use(mongoSanitize());
// Register webhook route with raw body parser BEFORE express.json()
// This ensures the webhook receives raw body for signature verification
app.post(
  "/api/booking/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // Import webhook handler
      const Booking = require("./models/booking.model.js");
      const Show = require("./models/show.model.js");

      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        console.error("STRIPE_SECRET_KEY is not set - webhook cannot be processed");
        return res.status(500).send("Stripe not configured on server");
      }

      let stripe;
      try {
        stripe = require("stripe")(stripeSecret);
      } catch (err) {
        console.error("Failed to initialize Stripe:", err?.message || err);
        return res.status(500).send("Stripe initialization failed");
      }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return res.status(400).send("Webhook secret not configured");
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Only process if payment was successful
        if (session.payment_status === "paid") {
          const bookingId = session.metadata?.bookingId;

          if (!bookingId) {
            console.error("No bookingId found in session metadata");
            return res.status(400).send("No bookingId in metadata");
          }

          // Find the booking
          const booking = await Booking.findById(bookingId);
          if (!booking) {
            console.error(`Booking not found: ${bookingId}`);
            return res.status(404).send("Booking not found");
          }

          // Check if already completed
          if (booking.status === "completed") {
            return res.json({ received: true });
          }

          // Check if seats are still available
          const show = await Show.findById(booking.show);
          if (!show) {
            booking.status = "failed";
            await booking.save();
            return res.status(400).send("Show not found");
          }

          // Check if any of the selected seats are already booked
          const conflictingSeats = booking.seats.filter((seat) =>
            show.bookedSeats.includes(seat)
          );

          if (conflictingSeats.length > 0) {
            booking.status = "failed";
            await booking.save();
            console.error(`Seats ${conflictingSeats.join(", ")} are already booked`);
            return res.status(400).send(`Seats ${conflictingSeats.join(", ")} are already booked`);
          }

          // Update booking
          booking.stripePaymentIntentId = session.payment_intent;
          booking.status = "completed";
          await booking.save();

          // Update show's bookedSeats array
          show.bookedSeats = [...show.bookedSeats, ...booking.seats];
          await show.save();

          console.log(`Booking ${bookingId} confirmed via webhook`);
        } else {
          console.log(
            `Payment not completed for session ${session.id}, status: ${session.payment_status}`
          );
        }
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Webhook processing failed");
    }
  }
);

// Apply JSON parser to all other routes
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/theatre", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/ai", aiRoutes);

app.listen(8001, () => {
  console.log("Server started..");
  console.log("MONGO_DB_URL =", process.env.MONGO_DB_URL);
});
