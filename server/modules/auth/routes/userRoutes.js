const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect); 

router.get("/profile", userController.getProfile);
router.put("/updateprofile", userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.post("/apply-teacher", userController.applyForTeacher);

module.exports = router;