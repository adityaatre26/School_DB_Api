const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).send({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  db.query(query, [name, address, latitude, longitude], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Database error" });
    }
    res.status(201).send({ message: "School added successfully" });
  });
});

app.get("/listSchools", (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .send({ error: "Latitude and Longitude are required" });
  }

  const query = `
        SELECT id, name, address, latitude, longitude,
        (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(latitude)))) AS distance
        FROM schools
        ORDER BY distance ASC;
    `;

  db.query(query, [latitude, longitude, latitude], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Database error" });
    }
    res.status(200).send(results);
  });
});

app.listen("3000", () => {
  console.log("Server is running on port 3000");
});
