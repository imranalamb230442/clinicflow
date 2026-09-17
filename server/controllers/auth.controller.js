const db = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET || "clinicflow-development-secret";

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = db
            .prepare(`
                INSERT INTO users (name, email, password_hash)
                VALUES (?, ?, ?)
            `)
            .run(name.trim(), normalizedEmail, passwordHash);

        const token = jwt.sign(
            {
                id: result.lastInsertRowid,
                name: name.trim(),
                email: normalizedEmail
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: result.lastInsertRowid,
                name: name.trim(),
                email: normalizedEmail
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = db
            .prepare(`
                SELECT id, name, email, password_hash
                FROM users
                WHERE email = ?
            `)
            .get(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};