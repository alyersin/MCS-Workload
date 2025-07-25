const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const app = express();

app.use(express.json({ limit: "1000mb" })); // adjust as needed
app.use(express.urlencoded({ limit: "1000mb", extended: true }));

// CORRECT ALLOWED ORIGINS
const allowedOrigins = [
  "http://localhost:3000",
  "https://mcs-workload.vercel.app", // CORRECTED DOMAIN
  "https://mcs-workload.duckdns.org",
];

// SIMPLIFIED AND CORRECT CORS CONFIGURATION
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

// REMOVED REDUNDANT MIDDLEWARE - ALREADY DEFINED AT THE TOP

// Add this right after your CORS configuration
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} – Origin: ${req.get(
      "origin"
    )}`
  );
  next();
});

// Handle preflight requests globally (covers all routes)
app.options("*", cors());

// ========== Multer Setup ==========
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, "uploads", "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: tempStorage });

// ========== Upload Route ==========
app.post("/upload", upload.array("file"), (req, res) => {
  try {
    const userId = (req.body.userId || "unknown-user").replace(
      /[^a-zA-Z0-9-_]/g,
      ""
    );
    const formType = (req.body.formType || "unknown-form")
      .toLowerCase()
      .replace(/\s+/g, "_");
    const submissionFolder = (req.body.submissionFolder || "unnamed").replace(
      /[^a-zA-Z0-9-_]/g,
      ""
    );

    const d = new Date(req.body.date || new Date());
    const formattedDate = `${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;

    const baseDir = path.join(
      __dirname,
      "uploads",
      userId,
      formType,
      formattedDate
    );
    const targetDir = path.join(baseDir, submissionFolder);

    fs.mkdirSync(targetDir, { recursive: true });

    req.files.forEach((file) => {
      const destPath = path.join(targetDir, file.filename);
      fs.renameSync(file.path, destPath);
    });

    res.json({
      success: true,
      files: req.files.map((f) => f.filename),
      folder: targetDir,
    });
  } catch (err) {
    console.error("upload error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during file upload." });
  }
});

// ORDER ID GENERATOR
function generateOrderId(type) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${type.toUpperCase()}-${date}-${random}`;
}

// POSTGRESQL CONNECTION SETUP
const pool = new Pool({
  user: "your_pg_user", // SET TO YOUR USER
  host: "localhost",
  database: "mcs_orders", // SET TO YOUR DB NAME
  password: "your_pg_password", // SET TO YOUR PASSWORD
  port: 5432,
});

// ========== ORDER CREATION ROUTE ==========
app.post("/api/orders", async (req, res) => {
  try {
    // userId MUST BE FIREBASE AUTH UID
    const { userId, orderType, details } = req.body;
    if (!userId || !orderType || !details) {
      return res
        .status(400)
        .json({ success: false, message: "MISSING FIELDS" });
    }
    const orderId = generateOrderId(orderType);
    const result = await pool.query(
      `INSERT INTO orders (order_id, user_id, order_type, status, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, userId, orderType, "In Progress", details]
    );
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error("ORDER CREATION ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "SERVER ERROR DURING ORDER CREATION" });
  }
});

// ========== GET ORDERS FOR USER ==========
app.get("/api/orders/:userId", async (req, res) => {
  try {
    // userId IS FIREBASE AUTH UID
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching orders." });
  }
});

// ========== GET ALL ORDERS (FOR MASTER ACCOUNT ONLY) ==========
app.get("/api/orders", async (req, res) => {
  try {
    // ONLY MASTER/RECEIVER SHOULD USE THIS ENDPOINT
    const result = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch all orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching all orders." });
  }
});

// ========== Simple GET ==========
app.get("/", (req, res) => {
  res.send("File upload server is running.");
});

// ========== Start Server ==========
app.listen(5000, "0.0.0.0", () => {
  console.log("Server started on port 5000");
});
