import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// Save contact message (no email)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.json({ success: true, contact });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get all messages (admin)
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
