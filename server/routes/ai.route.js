const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller.js");

router.post("/assistant", aiController.assistant);

module.exports = router;
