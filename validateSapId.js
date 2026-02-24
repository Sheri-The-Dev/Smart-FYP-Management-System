// validateSapId.js

const db = require("../config/database");

const validateSapId = async (sap_id) => {
    // Check if SAP ID exists
    if (!sap_id) {
        return { valid: false, message: "SAP ID is required" };
    }

    // Check format (8 digits only)
    const sapRegex = /^[0-9]{8}$/;
    if (!sapRegex.test(sap_id)) {
        return { valid: false, message: "SAP ID must be 8 digits" };
    }

    // Check duplicate in database
    const [rows] = await db.execute(
        "SELECT id FROM students WHERE sap_id = ?",
        [sap_id]
    );

    if (rows.length > 0) {
        return { valid: false, message: "SAP ID already registered" };
    }

    return { valid: true };
};

module.exports = validateSapId;
