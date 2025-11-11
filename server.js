// =======================
// server.js - Election Backend
// =======================

const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();
const PORT = 3000;

// =======================
// Fixed Admin Credentials
// =======================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // change as desired

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection(pool)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "votingsystem",
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Error connecting to MYSQL: ", err.message);
    console.log("Please check:");
    console.log("1. Is WAMP server running?");
    console.log("2. Is MYSQL running?");
    console.log("3. Is the database name correct?");
    console.log("4. Are the username and password correct?");
  } else {
    console.log("Successfully connected to MYSQL election database");
  }
});

// =======================
// Serve static files (CSS, JS, images, etc.)
// =======================
app.use(express.static(path.join(__dirname, "public")));

// =======================
// Page Routes
// =======================

// Login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmlFiles", "login.html"));
});

// Handle login POST request
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Successful login — redirect to dashboard
    res.redirect("/dashboard");
  } else {
    // Failed login — send error message
    res.status(401).send("Incorrect credentials. Please try again.");
  }
});

// Create Report page
app.get("/create-report", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmlFiles", "create-report.html"));
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmlFiles", "dashboard.html"));
});

// Sidebar navigation routes
app.get("/mUsers", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/OpenClose", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/calculateVotes", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/mResults", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/uploadWinners", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/generateReports", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/settings", (req, res) => {
  res.redirect("/dashboard");
});

// Logout route
app.get("/logout", (req, res) => {
  res.redirect("/"); // Redirect to login page
});

// =======================
// API Routes
// =======================

// Get all voters
app.get("/api/voters", (req, res) => {
  db.query("SELECT * FROM voters", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all observers
app.get("/api/observers", (req, res) => {
  db.query("SELECT * FROM observers", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all accreditation
app.get("/api/accreditation", (req, res) => {
  db.query("SELECT * FROM accreditation", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all parties
app.get("/api/parties", (req, res) => {
  db.query("SELECT * FROM parties", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all constituencies
app.get("/api/constituencies", (req, res) => {
  db.query("SELECT * FROM constituencies", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all polling centers
app.get("/api/pollingcenters", (req, res) => {
  db.query("SELECT * FROM polling_centers", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all candidates
app.get("/api/candidates", (req, res) => {
  db.query("SELECT * FROM candidates", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all elections
app.get("/api/elections", (req, res) => {
  db.query("SELECT * FROM elections", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all complaints
app.get("/api/complaints", (req, res) => {
  db.query("SELECT * FROM complaints", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all security incidents
app.get("/api/security", (req, res) => {
  db.query("SELECT * FROM security_incidents", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all user feedback
app.get("/api/feedback", (req, res) => {
  db.query("SELECT * FROM user_feedback", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// REPORTS API ROUTES
// =======================

// POST /api/reports - Create new report
app.post("/api/reports", (req, res) => {
  const { title, body, created_by, election_id } = req.body;

  // Validate required fields
  if (!title || !body || !created_by || !election_id) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: title, body, created_by, election_id'
    });
  }

  // Validate title length
  if (title.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Title must be 255 characters or less'
    });
  }

  // Insert into reports table
  const query = `
    INSERT INTO reports (title, body, created_by, election_id, created_at) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  db.query(query, [title, body, created_by, election_id], (err, results) => {
    if (err) {
      console.error('Error creating report:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report_id: results.insertId,
        title,
        body,
        created_by,
        election_id,
        created_at: new Date()
      }
    });
  });
});

// GET /api/reports - Get all reports for dashboard
app.get("/api/reports", (req, res) => {
  const query = `
    SELECT r.*, u.username as created_by_name, e.name as election_name 
    FROM reports r 
    LEFT JOIN users u ON r.created_by = u.user_id 
    LEFT JOIN elections e ON r.election_id = e.election_id 
    ORDER BY r.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reports:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching reports'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// Get all results
app.get("/api/results", (req, res) => {
  db.query("SELECT * FROM results", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all audit logs
app.get("/api/auditlogs", (req, res) => {
  db.query("SELECT * FROM audit_logs", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// ADDITIONAL API ROUTES
// =======================

// Get all wards
app.get("/api/wards", (req, res) => {
  db.query("SELECT * FROM wards", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all positions
app.get("/api/positions", (req, res) => {
  db.query("SELECT * FROM positions", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all ballots
app.get("/api/ballots", (req, res) => {
  db.query("SELECT * FROM ballot", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all alliances
app.get("/api/alliances", (req, res) => {
  db.query("SELECT * FROM alliances", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all transport data
app.get("/api/transport", (req, res) => {
  db.query("SELECT * FROM transport", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all transfer data
app.get("/api/transfer", (req, res) => {
  db.query("SELECT * FROM transfer", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all logistics data
app.get("/api/logistics", (req, res) => {
  db.query("SELECT * FROM logistics", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all winners
app.get("/api/winners", (req, res) => {
  db.query("SELECT * FROM winners", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/feedback", (req, res) => {
  db.query("SELECT * FROM feedback", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Get all election winners
app.get("/api/electionwinners", (req, res) => {
  db.query("SELECT * FROM election_winners", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all votes
app.get("/api/votes", (req, res) => {
  db.query("SELECT * FROM votes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get vote count data
app.get("/api/votecount", (req, res) => {
  db.query("SELECT candidate_id, COUNT(*) as vote_count FROM votes GROUP BY candidate_id", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get ballot management data
app.get("/api/ballotmanagement", (req, res) => {
  db.query("SELECT * FROM ballot_management", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get registered candidates
app.get("/api/registeredcandidates", (req, res) => {
  db.query("SELECT * FROM candidates WHERE registration_status = 'Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get non-registered candidates
app.get("/api/nonregisteredcandidates", (req, res) => {
  db.query("SELECT * FROM candidates WHERE registration_status = 'Not Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get registered voters
app.get("/api/registeredvoters", (req, res) => {
  db.query("SELECT * FROM voters WHERE registration_status = 'Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get non-registered voters
app.get("/api/nonregisteredvoters", (req, res) => {
  db.query("SELECT * FROM voters WHERE registration_status = 'Not Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// In your server.js, update the generateReports route:
app.get("/generateReports", (req, res) => {
  res.redirect("/create-report"); // Changed from /dashboard to /create-report
});
// Get all media houses
app.get("/api/mediahouses", (req, res) => {
  db.query("SELECT * FROM media_houses", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// Server Start
// =======================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Create reports at: http://localhost:${PORT}/create-report`);
});