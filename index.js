import express from "express";
import mongoose from "mongoose";

// --- CONNECT TO MONGODB ---
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err.message));

// --- EXPRESS APP ---
const app = express();
app.use(express.json());

// Example schema for saving Base44 records
const recordSchema = new mongoose.Schema({}, { strict: false });
const Record = mongoose.model("Record", recordSchema);

// --- THE ENDPOINT THAT BASE44 WILL CALL ---
app.post("/base44-sync", async (req, res) => {
  try {
    const data = req.body;

    // UPSERT (insert or update)
    await Record.updateOne(
      { id: data.id },
      { $set: data },
      { upsert: true }
    );

    console.log("Λήφθηκαν δεδομένα από Base44:", data);
    
    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err);
    res.sendStatus(500);
  }
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// --- START SERVER ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port", port);
});
