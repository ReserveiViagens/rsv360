const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Projects endpoint - implementation pending",
  });
});

module.exports = router;
