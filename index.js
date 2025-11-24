import express from "express";
import mongoose from "mongoose";

// --- CONNECT TO MONGODB ---
const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

// --- EXPRESS APP ---
const app = express();
app.use(express.json());

// Schema για να αποθηκεύουμε τα webhooks από Base44
const webhookSchema = new mongoose.Schema(
  {
    entity: String,
    operation: String,
    timestamp: String,
    record: Object,
  },
  { strict: false, timestamps: true }
);

const WebhookRecord = mongoose.model("WebhookRecord", webhookSchema);

// --- ENDPOINT ΠΟΥ ΚΑΛΕΙ ΤΟ BASE44 ---
app.post("/base44-sync", async (req, res) => {
  try {
    const payload = req.body;
    console.log("Webhook από Base44:", JSON.stringify(payload));

    const { entity, operation, timestamp, record } = payload;

    // Αποθήκευση / upsert στη Mongo
    await WebhookRecord.updateOne(
      {
        entity,
        "record.id": record?.id || record?._id || null,
      },
      {
        $set: {
          entity,
          operation,
          timestamp,
          record,
        },
      },
      { upsert: true }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Error in /base44-sync:", err);
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
