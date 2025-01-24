const mysql = require("mysql2");
require("dotenv").config();
const db = mysql.createConnection({
  host: process.env.DB_HOST, // XAMPP MySQL default host
  user: process.env.DB_USER,      // Default XAMPP MySQL username
  password: process.env.DB_PASSWORD,      // Default XAMPP MySQL password is blank
  database: process.env.DB_NAME, // The database you created
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

module.exports = db;
