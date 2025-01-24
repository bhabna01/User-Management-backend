// const express = require("express");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const mysql = require("mysql2");
// require("dotenv").config();
// const db = require("./db");
// const app = express();
// const PORT = process.env.PORT || 5000;
// const SECRET_KEY = process.env.SECRET_KEY


// app.use(cors());
// app.use(bodyParser.json());

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized access." });
//   }

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY); // Verify token
//     req.user = decoded; // Attach user data to the request
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token." });
//   }
// };

// // User Registration
// app.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   try {
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user into database
//     const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
//     db.query(query, [name, email, hashedPassword], (err, results) => {
//       if (err) {
//         if (err.code === "ER_DUP_ENTRY") {
//           return res.status(400).json({ error: "Email already exists." });
//         }
//         return res.status(500).json({ error: "Database error." });
//       }
//       res.status(201).json({ message: "User registered successfully." });
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Server error." });
//   }
// });

// // User Login
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   const query = `SELECT * FROM users WHERE email = ?`;
//   db.query(query, [email], async (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database error." });
//     }

//     if (results.length === 0) {
//       return res.status(400).json({ error: "Invalid email or password." });
//     }

//     const user = results[0];

//     if (user.status === "blocked") {
//       return res.status(403).json({ error: "Account is blocked." });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid email or password." });
//     }

//     // Update last login
//     db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);

//     // Generate JWT token
//     const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
//       expiresIn: "10d",
//     });

//     res.json({ message: "Login successful.", token });
//   });
// });

// // Get All Users (Admin Panel)
// // app.get("/users", (req, res) => {
// //   const token = req.headers.authorization?.split(" ")[1];

// //   if (!token) {
// //     return res.status(401).json({ error: "Unauthorized access." });
// //   }

// //   try {
// //     const decoded = jwt.verify(token, SECRET_KEY);

// //     const query = `SELECT id, name, email, status, last_login, registration_time FROM users`;
// //     db.query(query, (err, results) => {
// //       if (err) {
// //         return res.status(500).json({ error: "Database error." });
// //       }
// //       res.json(results);
// //     });
// //   } catch (err) {
// //     res.status(401).json({ error: "Invalid token." });
// //   }
// // });

// // Block or Unblock Users

// app.get("/users", verifyToken, (req, res) => {
//   const query = `SELECT id, name, email, status, last_login, registration_time FROM users`;
//   db.query(query, (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database error." });
//     }
//     res.json(results);
//   });
// });

// app.post("/users/block", (req, res) => {
//   const { userIds, action } = req.body;

//   if (!userIds || !action || !["block", "unblock"].includes(action)) {
//     return res.status(400).json({ error: "Invalid input." });
//   }

//   const status = action === "block" ? "blocked" : "active";
//   const query = `UPDATE users SET status = ? WHERE id IN (?)`;

//   db.query(query, [status, userIds], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database error." });
//     }
//     res.json({ message: `Users ${action}ed successfully.` });
//   });
// });

// // Delete Users
// app.post("/users/delete", (req, res) => {
//   const { userIds } = req.body;

//   if (!userIds) {
//     return res.status(400).json({ error: "No user IDs provided." });
//   }

//   const query = `DELETE FROM users WHERE id IN (?)`;
//   db.query(query, [userIds], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database error." });
//     }
//     res.json({ message: "Users deleted successfully." });
//   });
// });

// // Start Server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();
const db = require("./db");
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(cors());
app.use(bodyParser.json());

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Verify token
    req.user = decoded; // Attach user data to the request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

const checkUserStatus = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const query = `SELECT status FROM users WHERE id = ?`;
    db.query(query, [decoded.id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error." });
      }

      if (results.length === 0 || results[0].status === "blocked") {
        return res.status(403).json({ error: "Account is blocked." });
      }

      next(); // User is active, proceed to the next middleware/route
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// User Registration
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.query(query, [name, email, hashedPassword], (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Email already exists." });
        }
        return res.status(500).json({ error: "Database error." });
      }
      res.status(201).json({ message: "User registered successfully." });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = results[0];

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Account is blocked." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Update last login
    db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "10d",
    });

    res.json({ message: "Login successful.", token });
  });
});

// Get All Users (Admin Panel)
app.get("/users", verifyToken, checkUserStatus, (req, res) => {
  const query = `SELECT id, name, email, status, last_login, registration_time FROM users`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }
    res.json(results);
  });
});

// Block or Unblock Users
app.post("/users/block", verifyToken, checkUserStatus, (req, res) => {
  const { userIds, action } = req.body;

  if (!userIds || !action || !["block", "unblock"].includes(action)) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const status = action === "block" ? "blocked" : "active";
  const query = `UPDATE users SET status = ? WHERE id IN (?)`;

  db.query(query, [status, userIds], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }
    res.json({ message: `Users ${action}ed successfully.` });
  });
});

// Delete Users
app.post("/users/delete", verifyToken, checkUserStatus, (req, res) => {
  const { userIds } = req.body;

  if (!userIds) {
    return res.status(400).json({ error: "No user IDs provided." });
  }

  const query = `DELETE FROM users WHERE id IN (?)`;
  db.query(query, [userIds], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }
    res.json({ message: "Users deleted successfully." });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
