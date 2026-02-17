router.post("/register", async (req, res) => {
  const { name, email, password, sap_id } = req.body;

  const query = 
    "INSERT INTO students (name, email, password, sap_id) VALUES (?, ?, ?, ?)";

  await db.query(query, [name, email, password, sap_id]);

  res.json({ message: "Student registered successfully" });
});
