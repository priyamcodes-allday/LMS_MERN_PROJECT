const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistController");

router.post("/", wishlistController.addToWishlist);
router.get("/:studentId", wishlistController.getWishlist);
router.delete("/remove", wishlistController.removeFromWishlist);

module.exports = router;
