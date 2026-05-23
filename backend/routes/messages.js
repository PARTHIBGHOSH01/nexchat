const express = require("express");
const Message = require("../models/Message");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/messages/:roomId — fetch last 50 messages for a room
router.get("/:roomId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
