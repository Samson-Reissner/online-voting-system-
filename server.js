// =======================
// server.js - Election Backend
// =======================

const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const session = require("express-session"); // ADD THIS
const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Fixed Admin Credentials
// =======================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // change as desired

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ADD SESSION MIDDLEWARE
app.use(session({
  secret: 'mec-election-system-secret-key-2025', // Change this in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database connection(pool)
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "votingsystem",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
// AUTHENTICATION MIDDLEWARE
// =======================
function requireAuth(req, res, next) {
  if (req.session.user && req.session.user.loggedIn) {
    next();
  } else {
    res.redirect('/');
  }
}

// =======================
// Page Routes
// =======================

// Login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmlFiles", "login.html"));
});

// Handle login POST request - UPDATED WITH SESSION
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Successful login — create session
    req.session.user = {
      username: username,
      loggedIn: true
    };
    res.redirect("/dashboard");
  } else {
    // Failed login — send error message
    res.status(401).send("Incorrect credentials. Please try again.");
  }
});

// Create Report page - PROTECTED
app.get("/create-report", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmlFiles", "create-report.html"));
});

// Dashboard page - PROTECTED
app.get("/dashboard", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmlFiles", "dashboard.html"));
});

// Sidebar navigation routes - PROTECTED
app.get("/mUsers", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

app.get("/OpenClose", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

app.get("/calculateVotes", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

app.get("/mResults", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

app.get("/uploadWinners", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

app.get("/generateReports", requireAuth, (req, res) => {
  res.redirect("/create-report");
});

app.get("/settings", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

// Logout route - UPDATED
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session:', err);
    }
    res.redirect("/");
  });
});

// =======================
// API Routes - PROTECTED
// =======================

// Get all voters
app.get("/api/voters", requireAuth, (req, res) => {
  db.query("SELECT * FROM voters", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all observers
app.get("/api/observers", requireAuth, (req, res) => {
  db.query("SELECT * FROM observers", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all accreditation
app.get("/api/accreditation", requireAuth, (req, res) => {
  db.query("SELECT * FROM accreditation", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all parties
app.get("/api/parties", requireAuth, (req, res) => {
  db.query("SELECT * FROM parties", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all constituencies
app.get("/api/constituencies", requireAuth, (req, res) => {
  db.query("SELECT * FROM constituencies", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all polling centers
app.get("/api/pollingcenters", requireAuth, (req, res) => {
  db.query("SELECT * FROM polling_centers", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all candidates
app.get("/api/candidates", requireAuth, (req, res) => {
  db.query("SELECT * FROM candidates", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all elections
app.get("/api/elections", requireAuth, (req, res) => {
  db.query("SELECT * FROM elections", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all complaints
app.get("/api/complaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all security incidents
app.get("/api/security", requireAuth, (req, res) => {
  db.query("SELECT * FROM security_incidents", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all user feedback
app.get("/api/feedback", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// MISSING COMPLAINTS API ROUTES - ADD THESE
// =======================

app.get("/api/pendingcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'pending'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/reviewcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'under review'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/resolvedcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'resolved'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/rejectedcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'rejected'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/complaintstats", requireAuth, (req, res) => {
  db.query("SELECT status, COUNT(*) as count FROM complaints GROUP BY status", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// MISSING FEEDBACK API ROUTES - ADD THESE
// =======================

app.get("/api/positivefeedback", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback WHERE sentiment = 'positive' OR rating >= 4", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/negativefeedback", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback WHERE sentiment = 'negative' OR rating <= 2", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/suggestions", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback WHERE type = 'suggestion'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/feedbackanalytics", requireAuth, (req, res) => {
  db.query("SELECT type, sentiment, COUNT(*) as count FROM user_feedback GROUP BY type, sentiment", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/feedbackresponse", requireAuth, (req, res) => {
  db.query("SELECT f.*, r.response_text, r.responded_by, r.response_date FROM user_feedback f LEFT JOIN feedback_responses r ON f.feedback_id = r.feedback_id", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// REPORTS API ROUTES - PROTECTED
// =======================

// POST /api/reports - Create new report
app.post("/api/reports", requireAuth, (req, res) => {
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
app.get("/api/reports", requireAuth, (req, res) => {
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
app.get("/api/results", requireAuth, (req, res) => {
  db.query("SELECT * FROM results", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all audit logs
app.get("/api/auditlogs", requireAuth, (req, res) => {
  db.query("SELECT * FROM audit_logs", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// ADDITIONAL API ROUTES - PROTECTED
// =======================

// Get all wards
app.get("/api/wards", requireAuth, (req, res) => {
  db.query("SELECT * FROM wards", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all positions
app.get("/api/positions", requireAuth, (req, res) => {
  db.query("SELECT * FROM positions", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all ballots
app.get("/api/ballots", requireAuth, (req, res) => {
  db.query("SELECT * FROM ballot", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all alliances
app.get("/api/alliances", requireAuth, (req, res) => {
  db.query("SELECT * FROM alliances", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all transport data
app.get("/api/transport", requireAuth, (req, res) => {
  db.query("SELECT * FROM transport", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all transfer data
app.get("/api/transfer", requireAuth, (req, res) => {
  db.query("SELECT * FROM transfer", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all logistics data
app.get("/api/logistics", requireAuth, (req, res) => {
  db.query("SELECT * FROM logistics", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all winners
app.get("/api/winners", requireAuth, (req, res) => {
  db.query("SELECT * FROM winners", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all election winners
app.get("/api/electionwinners", requireAuth, (req, res) => {
  db.query("SELECT * FROM election_winners", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all votes
app.get("/api/votes", requireAuth, (req, res) => {
  db.query("SELECT * FROM votes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get vote count data
app.get("/api/votecount", requireAuth, (req, res) => {
  db.query("SELECT candidate_id, COUNT(*) as vote_count FROM votes GROUP BY candidate_id", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get ballot management data
app.get("/api/ballotmanagement", requireAuth, (req, res) => {
  db.query("SELECT * FROM ballot_management", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get registered candidates
app.get("/api/registeredcandidates", requireAuth, (req, res) => {
  db.query("SELECT * FROM candidates WHERE registration_status = 'Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get non-registered candidates
app.get("/api/nonregisteredcandidates", requireAuth, (req, res) => {
  db.query("SELECT * FROM candidates WHERE registration_status = 'Not Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get registered voters
app.get("/api/registeredvoters", requireAuth, (req, res) => {
  db.query("SELECT * FROM voters WHERE registration_status = 'Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get non-registered voters
app.get("/api/nonregisteredvoters", requireAuth, (req, res) => {
  db.query("SELECT * FROM voters WHERE registration_status = 'Not Registered'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all media houses
app.get("/api/mediahouses", requireAuth, (req, res) => {
  db.query("SELECT * FROM media_houses", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/api/feedbackresponse", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Add these missing API routes
app.get("/api/pendingcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'pending'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/reviewcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'under review'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/resolvedcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'resolved'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/rejectedcomplaints", requireAuth, (req, res) => {
  db.query("SELECT * FROM complaints WHERE status = 'rejected'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/complaintstats", requireAuth, (req, res) => {
  db.query("SELECT status, COUNT(*) as count FROM complaints GROUP BY status", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Feedback routes
app.get("/api/positivefeedback", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback WHERE sentiment = 'positive'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/negativefeedback", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback WHERE sentiment = 'negative'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/suggestions", requireAuth, (req, res) => {
  db.query("SELECT * FROM user_feedback WHERE type = 'suggestion'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/feedbackanalytics", requireAuth, (req, res) => {
  db.query("SELECT type, sentiment, COUNT(*) as count FROM user_feedback GROUP BY type, sentiment", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =======================
// Server Start
// =======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Login with: username="admin", password="admin123"`);
  console.log(`Create reports at: http://localhost:${PORT}/create-report`);
});