const {
    createUser,
    loginUser,
    getUserProfile
} = require("../controllers/users");
const authMiddleware = require("../middleware/auth");

const router = require("express").Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;