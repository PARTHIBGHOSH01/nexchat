const express = require("express");
const Room = require("../models/Room");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/rooms — list all rooms
router.get("/", verifyToken, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("creator", "name")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms — create a room
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Room name is required" });

    const exists = await Room.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "A room with that name exists" });

    const room = await Room.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id],
    });
    await room.populate("creator", "name");
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms/:id/join — join a room
router.post("/:id/join", verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json({ message: "Joined room", room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/rooms/:id — delete room (creator only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the creator can delete" });

    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
