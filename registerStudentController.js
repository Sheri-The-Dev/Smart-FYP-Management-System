const db = require("../config/database");
const bcrypt = require("bcrypt");
const validateSapId = require("../utils/validateSapId");

const registerStudent = async (req, res) => {
    const { name, email, sap_id, password } = req.body;

    try {
        // Validate SAP ID
        const validation = await validateSapId(sap_id);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert student
        await db.execute(
            "INSERT INTO students (name, email, sap_id, password) VALUES (?, ?, ?, ?)",
            [name, email, sap_id, hashedPassword]
        );

        res.status(201).json({ message: "Student registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = registerStudent;
