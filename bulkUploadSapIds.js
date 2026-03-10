const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const mysql = require("mysql");

const app = express();

// database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "fypms"
});

// file upload storage
const upload = multer({ dest: "uploads/" });

// upload route
app.post("/upload-sap-ids", upload.single("file"), (req, res) => {

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {
            results.push(data);
        })
        .on("end", () => {

            results.forEach((student) => {
                const sap_id = student.sap_id;

                const query = "INSERT INTO students (sap_id) VALUES (?)";

                db.query(query, [sap_id], (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            });

            res.send("Bulk SAP IDs uploaded successfully");
        });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
