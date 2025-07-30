const bcrypt = require("bcrypt");
const User = require("../models/users");
// Temporary in-memory user storage for testing
const users = [];

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, shopName, shopAddress } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword || !shopName || !shopAddress) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if user already exists in DB
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in DB
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            shopName,
            shopAddress
        });

        // Set session data
        req.session.userId = user._id;
        req.session.email = user.email;

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            shopName: user.shopName,
            shopAddress: user.shopAddress,
            createdAt: user.createdAt
        };

        res.status(201).json({
            message: "User created successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user in DB
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({ message: "User with this email does not exist" });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Set session data
        req.session.userId = user._id;
        req.session.email = user.email;

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            shopName: user.shopName,
            shopAddress: user.shopAddress
        };

        res.status(200).json({
            message: "Login successful",
            user: userResponse
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user profile (protected route)
exports.getUserProfile = async (req, res) => {
    try {
        const user = users.find(u => u._id === req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Logout user
exports.logoutUser = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Error logging out" });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: "Logged out successfully" });
        });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Check if user is authenticated
exports.checkAuth = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        
        const user = users.find(u => u._id === req.session.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        console.error("Error checking auth:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
