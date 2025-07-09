import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGODB_URI);

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db("vocabulary_db"); // Replace with your actual database name
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/words", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const collection = db.collection("words"); // Replace with your actual collection name
    const words = await collection.find({}).skip(skip).limit(limit).toArray();

    res.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

app.get("/api/words/count", async (req, res) => {
  try {
    const collection = db.collection("words");
    const count = await collection.countDocuments({});
    res.json({ count });
  } catch (error) {
    console.error("Error counting words:", error);
    res.status(500).json({ error: "Failed to count words" });
  }
});

app.get("/api/words/bookmarked", async (req, res) => {
  try {
    const collection = db.collection("words");
    const bookmarkedWords = await collection
      .find({ bookmarked: true })
      .toArray();
    res.json(bookmarkedWords);
  } catch (error) {
    console.error("Error fetching bookmarked words:", error);
    res.status(500).json({ error: "Failed to fetch bookmarked words" });
  }
});

app.put("/api/words/:id/bookmark", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection("words");

    // Get current bookmark status
    const word = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }

    // Toggle bookmark status
    const newBookmarkStatus = !word.bookmarked;
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { bookmarked: newBookmarkStatus } }
    );

    res.json({ success: true, bookmarked: newBookmarkStatus });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    res.status(500).json({ error: "Failed to update bookmark" });
  }
});

// Start server
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
