const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

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

// ========== Simple GET ==========
app.get("/", (req, res) => {
  res.send("File upload server is running.");
});

// ========== Start Server ==========
app.listen(5000, "0.0.0.0", () => {
  console.log("Server started on port 5000");
});
