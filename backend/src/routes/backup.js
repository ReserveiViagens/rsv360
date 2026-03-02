const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backup endpoint - implementation pending",
  });
});

module.exports = router;
