const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const archiver = require("archiver");

// REMOVED DOTENV - USING HARDCODED VALUES LIKE ORIGINAL SETUP
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
    methods: ["GET", "POST", "PUT", "OPTIONS"],
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
  user: "alyersin", // SET TO YOUR USER
  host: "localhost",
  database: "mcs_orders", // SET TO YOUR DB NAME
  password: "8642317!", // SET TO YOUR PASSWORD
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
      [orderId, userId, orderType, "In Progress", JSON.stringify(details)]
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
    // ONLY FETCH IN PROGRESS ORDERS FOR DASHBOARD
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 AND status = 'In Progress' ORDER BY created_at DESC`,
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
    // ONLY FETCH IN PROGRESS ORDERS FOR DASHBOARD
    const result = await pool.query(
      `SELECT * FROM orders WHERE status = 'In Progress' ORDER BY created_at DESC`
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch all orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching all orders." });
  }
});

// ========== GET ALL ORDERS (INCLUDING COMPLETED) FOR USER ==========
app.get("/api/all-orders/:userId", async (req, res) => {
  try {
    // userId IS FIREBASE AUTH UID
    const { userId } = req.params;
    // FETCH ALL ORDERS (BOTH IN PROGRESS AND COMPLETED) FOR FULL HISTORY
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch all orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching all orders." });
  }
});

// ========== GET ALL ORDERS (INCLUDING COMPLETED) FOR MASTER ACCOUNT ==========
app.get("/api/all-orders", async (req, res) => {
  try {
    // ONLY MASTER/RECEIVER SHOULD USE THIS ENDPOINT
    // FETCH ALL ORDERS (BOTH IN PROGRESS AND COMPLETED) FOR FULL HISTORY
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

// ========== COMPLETE ORDER ROUTE ==========
app.post(
  "/api/orders/complete-order",
  upload.array("file"),
  async (req, res) => {
    try {
      const { orderId, userId, orderType, completionDate } = req.body;

      // VALIDATE REQUIRED FIELDS
      if (!orderId || !userId || !orderType) {
        return res.status(400).json({
          success: false,
          message: "MISSING REQUIRED FIELDS",
        });
      }

      // SECRET KEY VALIDATION IS HANDLED ON FRONTEND - NO NEED TO VALIDATE HERE

      // CREATE COMPLETED ORDERS FOLDER
      const completedOrdersDir = path.join(
        __dirname,
        "uploads",
        "COMPLETED ORDERS"
      );
      fs.mkdirSync(completedOrdersDir, { recursive: true });

      // MOVE UPLOADED FILES TO COMPLETED ORDERS FOLDER
      const uploadedFiles = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const orderFolder = path.join(completedOrdersDir, orderId);
          fs.mkdirSync(orderFolder, { recursive: true });

          const destPath = path.join(orderFolder, file.filename);
          fs.renameSync(file.path, destPath);
          uploadedFiles.push(file.filename);
        }
      }

      // GET ORIGINAL ORDER DATA
      const orderResult = await pool.query(
        `SELECT * FROM orders WHERE order_id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "ORDER NOT FOUND",
        });
      }

      const originalOrder = orderResult.rows[0];

      // VALIDATE AND CLEAN DATA BEFORE INSERTION
      const cleanOrderId = String(orderId).trim();
      const cleanUserId = String(userId).trim();
      const cleanOrderType = String(orderType).trim();
      const cleanCompletionDate = completionDate
        ? new Date(completionDate)
        : new Date();
      const cleanOriginalData = JSON.stringify(originalOrder);
      const createdBy = originalOrder.user_id; // original creator
      const completedBy = cleanUserId; // the user completing the order (usually master)

      console.log("CLEANED DATA:", {
        orderId: cleanOrderId,
        userId: cleanUserId,
        orderType: cleanOrderType,
        originalOrderUserId: originalOrder.user_id,
        createdBy,
        completedBy,
      });

      // INSERT INTO COMPLETED_ORDERS TABLE WITH VALIDATED DATA
      console.log("INSERTING INTO COMPLETED_ORDERS:", {
        orderId: cleanOrderId,
        userId: cleanUserId,
        orderType: cleanOrderType,
        completionDate: cleanCompletionDate,
        createdBy,
        completedBy,
      });

      try {
        await pool.query(
          `INSERT INTO completed_orders (
              order_id, user_id, order_type, completion_date, original_order_data, created_by, completed_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            cleanOrderId,
            createdBy, // user_id is now the creator for compatibility
            cleanOrderType,
            cleanCompletionDate,
            cleanOriginalData,
            createdBy,
            completedBy,
          ]
        );

        console.log("SUCCESSFULLY INSERTED INTO COMPLETED_ORDERS");
      } catch (insertError) {
        console.error("ERROR INSERTING INTO COMPLETED_ORDERS:", insertError);
        throw insertError;
      }

      // UPDATE ORDER STATUS TO COMPLETED
      const updateResult = await pool.query(
        `UPDATE orders SET status = 'Completed' WHERE order_id = $1`,
        [cleanOrderId]
      );

      console.log("ORDER STATUS UPDATE RESULT:", {
        orderId: cleanOrderId,
        rowsAffected: updateResult.rowCount,
        success: updateResult.rowCount > 0,
      });

      res.json({
        success: true,
        message: "ORDER COMPLETED SUCCESSFULLY",
        uploadedFiles,
        orderId: cleanOrderId,
      });
    } catch (err) {
      console.error("Complete order error:", err);
      res.status(500).json({
        success: false,
        message: "SERVER ERROR DURING ORDER COMPLETION",
      });
    }
  }
);

// REMOVED UNUSED PUT ENDPOINT - POST ENDPOINT HANDLES ORDER COMPLETION

// ========== GET COMPLETED ORDERS FOR USER ==========
app.get("/api/completed-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("FETCHING COMPLETED ORDERS FOR USER:", userId);

    // DEBUG: LOG ALL COMPLETED ORDERS TO SEE WHAT'S IN THE TABLE
    const allCompletedOrders = await pool.query(
      `SELECT * FROM completed_orders ORDER BY completion_date DESC`
    );
    console.log("ALL COMPLETED ORDERS IN TABLE:", allCompletedOrders.rows);

    const result = await pool.query(
      `SELECT * FROM completed_orders WHERE user_id = $1 OR created_by = $1 OR completed_by = $1 ORDER BY completion_date DESC`,
      [userId]
    );

    console.log("COMPLETED ORDERS FOUND FOR USER:", result.rows.length);
    console.log("COMPLETED ORDERS DATA:", result.rows);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch completed orders error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching completed orders.",
    });
  }
});

// ========== ALIAS ENDPOINTS FOR FRONTEND COMPATIBILITY ==========
// FRONTEND CALLS /api/orders/completed-orders BUT SERVER HAS /api/completed-orders
app.get("/api/orders/completed-orders", async (req, res) => {
  try {
    console.log("FETCHING ALL COMPLETED ORDERS FOR MASTER ACCOUNT (ALIAS)");

    const result = await pool.query(
      `SELECT * FROM completed_orders ORDER BY completion_date DESC`
    );

    console.log("ALL COMPLETED ORDERS FOUND (ALIAS):", result.rows.length);
    console.log("COMPLETED ORDERS DATA (ALIAS):", result.rows);

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch all completed orders error (alias):", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching all completed orders.",
    });
  }
});

app.get("/api/orders/completed-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("FETCHING COMPLETED ORDERS FOR USER (ALIAS):", userId);

    const result = await pool.query(
      `SELECT * FROM completed_orders WHERE user_id = $1 OR created_by = $1 OR completed_by = $1 ORDER BY completion_date DESC`,
      [userId]
    );

    console.log("COMPLETED ORDERS FOUND FOR USER (ALIAS):", result.rows.length);
    console.log("COMPLETED ORDERS DATA (ALIAS):", result.rows);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch completed orders error (alias):", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching completed orders.",
    });
  }
});

// ========== GET ALL COMPLETED ORDERS (FOR MASTER ACCOUNT ONLY) ==========
app.get("/api/completed-orders", async (req, res) => {
  try {
    console.log("FETCHING ALL COMPLETED ORDERS FOR MASTER ACCOUNT");

    const result = await pool.query(
      `SELECT * FROM completed_orders ORDER BY completion_date DESC`
    );

    console.log("ALL COMPLETED ORDERS FOUND:", result.rows.length);
    console.log("COMPLETED ORDERS DATA:", result.rows);

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Fetch all completed orders error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching all completed orders.",
    });
  }
});

// ========== GET FILES FOR COMPLETED ORDER ==========
app.get("/api/completed-order-files/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const completedOrdersDir = path.join(
      __dirname,
      "uploads",
      "COMPLETED ORDERS"
    );
    const orderFolder = path.join(completedOrdersDir, orderId);

    if (!fs.existsSync(orderFolder)) {
      return res.json({ success: true, files: [] });
    }

    const files = fs.readdirSync(orderFolder);
    res.json({ success: true, files });
  } catch (err) {
    console.error("Fetch completed order files error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching completed order files.",
    });
  }
});

// ========== DOWNLOAD COMPLETED ORDER FILE ==========
app.get("/api/download-completed-file/:orderId/:fileName", async (req, res) => {
  try {
    const { orderId, fileName } = req.params;
    const completedOrdersDir = path.join(
      __dirname,
      "uploads",
      "COMPLETED ORDERS"
    );
    const orderFolder = path.join(completedOrdersDir, orderId);
    const filePath = path.join(orderFolder, decodeURIComponent(fileName));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    res.download(filePath);
  } catch (err) {
    console.error("Download completed file error:", err);
    res.status(500).json({
      success: false,
      message: "Server error downloading file.",
    });
  }
});

// ========== DOWNLOAD ALL COMPLETED ORDER FILES AS ZIP ==========
app.get("/api/download-all-completed-files/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const completedOrdersDir = path.join(
      __dirname,
      "uploads",
      "COMPLETED ORDERS"
    );
    const orderFolder = path.join(completedOrdersDir, orderId);

    if (!fs.existsSync(orderFolder)) {
      return res.status(404).json({
        success: false,
        message: "Order folder not found.",
      });
    }

    const files = fs.readdirSync(orderFolder);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files found for this order.",
      });
    }

    // SET HEADERS FOR ZIP DOWNLOAD
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${orderId}-report.zip"`
    );

    // CREATE ZIP ARCHIVE
    const archive = archiver("zip", {
      zlib: { level: 9 }, // MAXIMUM COMPRESSION
    });

    // PIPE ARCHIVE TO RESPONSE
    archive.pipe(res);

    // ADD FILES TO ARCHIVE
    files.forEach((file) => {
      const filePath = path.join(orderFolder, file);
      archive.file(filePath, { name: file });
    });

    // FINALIZE ARCHIVE
    await archive.finalize();
  } catch (err) {
    console.error("Download all completed files error:", err);
    res.status(500).json({
      success: false,
      message: "Server error creating zip file.",
    });
  }
});

// ========== Simple GET ==========
app.get("/", (req, res) => {
  res.send("File upload server is running.");
});

// ========== DEBUG: CHECK COMPLETED ORDERS TABLE ==========
app.get("/api/debug/completed-orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM completed_orders ORDER BY completion_date DESC`
    );
    res.json({
      success: true,
      count: result.rows.length,
      orders: result.rows,
    });
  } catch (err) {
    console.error("Debug completed orders error:", err);
    res.status(500).json({
      success: false,
      message: "Server error checking completed orders table.",
    });
  }
});

// ========== DEBUG: CHECK COMPLETED ORDERS FOR SPECIFIC USER ==========
app.get("/api/debug/completed-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("DEBUG: Checking completed orders for user:", userId);

    const result = await pool.query(
      `SELECT * FROM completed_orders WHERE user_id = $1 ORDER BY completion_date DESC`,
      [userId]
    );

    console.log(
      "DEBUG: Found",
      result.rows.length,
      "completed orders for user",
      userId
    );

    res.json({
      success: true,
      userId: userId,
      count: result.rows.length,
      orders: result.rows,
    });
  } catch (err) {
    console.error("Debug completed orders for user error:", err);
    res.status(500).json({
      success: false,
      message: "Server error checking completed orders for user.",
    });
  }
});

// ========== DEBUG: CHECK SPECIFIC ORDER STATUS ==========
app.get("/api/debug/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("DEBUG: Checking order status for:", orderId);

    // CHECK ORDERS TABLE
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [orderId]
    );

    // CHECK COMPLETED_ORDERS TABLE
    const completedOrderResult = await pool.query(
      `SELECT * FROM completed_orders WHERE order_id = $1`,
      [orderId]
    );

    console.log(
      "DEBUG: Order found in orders table:",
      orderResult.rows.length > 0
    );
    console.log(
      "DEBUG: Order found in completed_orders table:",
      completedOrderResult.rows.length > 0
    );

    // DEBUG: CHECK ALL COMPLETED ORDERS
    const allCompletedOrders = await pool.query(
      `SELECT order_id, user_id, created_by, completed_by FROM completed_orders`
    );
    console.log(
      "DEBUG: All completed orders in table:",
      allCompletedOrders.rows
    );

    res.json({
      success: true,
      orderId: orderId,
      inOrdersTable: orderResult.rows.length > 0,
      inCompletedOrdersTable: completedOrderResult.rows.length > 0,
      orderData: orderResult.rows[0] || null,
      completedOrderData: completedOrderResult.rows[0] || null,
      allCompletedOrders: allCompletedOrders.rows,
    });
  } catch (err) {
    console.error("Debug order status error:", err);
    res.status(500).json({
      success: false,
      message: "Server error checking order status.",
    });
  }
});

// ========== Start Server ==========
app.listen(5000, "0.0.0.0", () => {
  console.log("Server started on port 5000");

  // CREATE COMPLETED_ORDERS TABLE IF IT DOESN'T EXIST
  pool
    .query(
      `
    CREATE TABLE IF NOT EXISTS completed_orders (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(64) UNIQUE NOT NULL,
      user_id VARCHAR(128) NOT NULL,
      order_type VARCHAR(64) NOT NULL,
      completion_date TIMESTAMP DEFAULT NOW(),
      original_order_data JSONB,
      created_by VARCHAR(128) NOT NULL,
      completed_by VARCHAR(128) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
    )
    .then(() => {
      console.log("Completed orders table ready");
    })
    .catch((err) => {
      console.error("Error creating completed_orders table:", err);
    });
});
