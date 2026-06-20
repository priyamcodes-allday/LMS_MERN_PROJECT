const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

router.post("/", cartController.addToCart);
router.delete("/remove", cartController.removeFromCart);
router.get("/:studentId", cartController.getCart);

module.exports = router;
