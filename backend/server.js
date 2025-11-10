/**
 * WebSocket Demo Backend Server
 * This server provides:
 * 1. REST API endpoints for basic operations
 * 2. WebSocket connections for real-time communication
 * 3. PostgreSQL database for message persistence
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { Pool } = require("pg");
const cors = require("cors");

// Load .env only in development (production uses environment variables)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS for React Native mobile app
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for demo purposes
    methods: ["GET", "POST"],
  },
});

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your environment or .env file");
  process.exit(1);
}

// Log database connection info (without showing password)
console.log(
  "🔗 Database connection:",
  process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")
);

// PostgreSQL connection pool
// Pool manages multiple database connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Initialize Database
 * Create the messages table if it doesn't exist
 */
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
}

// Initialize database on server start
initializeDatabase();

/**
 * REST API Routes
 */

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "WebSocket server is running",
    timestamp: new Date().toISOString(),
  });
});

// Get all messages from database
app.get("/api/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 50"
    );
    res.json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
});

// Delete all messages (for demo reset)
app.delete("/api/messages", async (req, res) => {
  try {
    await pool.query("DELETE FROM messages");
    res.json({
      success: true,
      message: "All messages deleted",
    });

    // Notify all connected clients about the reset
    io.emit("messages_cleared");
  } catch (error) {
    console.error("Error deleting messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete messages",
    });
  }
});

/**
 * WebSocket Event Handlers
 */

// Track connected users
let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(
    `✅ New client connected: ${socket.id} (Total: ${connectedUsers})`
  );

  // Broadcast updated user count to all clients
  io.emit("user_count", { count: connectedUsers });

  /**
   * Handle 'send_message' event
   * Receives a message from client, saves to database, and broadcasts to all clients
   */
  socket.on("send_message", async (data) => {
    try {
      const { username, content } = data;

      // Validate input
      if (!username || !content) {
        socket.emit("error", { message: "Username and content are required" });
        return;
      }

      // Save message to database
      const result = await pool.query(
        "INSERT INTO messages (username, content) VALUES ($1, $2) RETURNING *",
        [username, content]
      );

      const savedMessage = result.rows[0];

      console.log(`📨 Message from ${username}: ${content}`);

      // Broadcast the new message to all connected clients
      io.emit("new_message", {
        id: savedMessage.id,
        username: savedMessage.username,
        content: savedMessage.content,
        created_at: savedMessage.created_at,
      });
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  /**
   * Handle 'typing' event
   * Broadcasts typing indicator to other clients
   */
  socket.on("typing", (data) => {
    socket.broadcast.emit("user_typing", { username: data.username });
  });

  /**
   * Handle 'stop_typing' event
   * Broadcasts stop typing indicator to other clients
   */
  socket.on("stop_typing", (data) => {
    socket.broadcast.emit("user_stop_typing", { username: data.username });
  });

  /**
   * Handle client disconnect
   * Updates and broadcasts the new user count
   */
  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(
      `❌ Client disconnected: ${socket.id} (Total: ${connectedUsers})`
    );

    // Broadcast updated user count to remaining clients
    io.emit("user_count", { count: connectedUsers });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🗄️  Connected to PostgreSQL database`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end();
  });
});
