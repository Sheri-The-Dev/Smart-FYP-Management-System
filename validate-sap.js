const checkSapExists = async (sap_id) => {
  const [rows] = await db.query(
    "SELECT * FROM students WHERE sap_id = ?",
    [sap_id]
  );
  return rows.length > 0;
};

module.exports = checkSapExists;
