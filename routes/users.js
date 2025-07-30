const {
    createUser,
    loginUser,
    getUserProfile,
    logoutUser,
    checkAuth
} = require("../controllers/users");
const authMiddleware = require("../middleware/auth");

const router = require("express").Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/logout", logoutUser);
router.get("/check-auth", checkAuth);

module.exports = router;