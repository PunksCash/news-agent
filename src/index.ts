import { config } from "dotenv";
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import newsRoutes from "./routes/news.routes.js";
import mcpRoutes from "./routes/mcp.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { PAYMENT_CONFIG, getFacilitatorUrl, getPaymentAddress, isPaymentConfigured } from "./config/payment.config.js";
import { paymentMiddleware } from "x402-express";

// Load environment variables
config();

if (!isPaymentConfigured()) {
  console.log("⚠️  Payment not configured. Set FACILITATOR_URL and ADDRESS in .env file");
  console.log("⚠️  Server will run without payment requirements");
}

const facilitatorUrl = getFacilitatorUrl();
const payTo = getPaymentAddress();

if (!isPaymentConfigured()) {
  console.log("⚠️  Payment not configured. Set FACILITATOR_URL and ADDRESS in .env file");
  console.log("⚠️  Server will run without payment requirements");
}


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Payment middleware for tool endpoints (if configured)
if (facilitatorUrl && payTo) {
  console.log("💰 Payment middleware enabled for tool endpoints");
  app.use(
    paymentMiddleware(
      payTo,
      {
        "GET /mcp/get_news": PAYMENT_CONFIG.tools.get_news,
        "GET /mcp/search_news": PAYMENT_CONFIG.tools.search_news,
        "GET /mcp": PAYMENT_CONFIG.jsonRpc,
      },
      {
        url: facilitatorUrl,
      },
    ),
  );
}


// Routes
app.use("/", healthRoutes);
app.use("/mcp", newsRoutes);
app.use("/mcp", mcpRoutes);

// Error handling middleware2
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 News Agent MCP Server");
  console.log("=".repeat(60));
  console.log(`\n📡 Server running on http://localhost:${PORT}`);
  
  // Payment status
  if (isPaymentConfigured()) {
    console.log(`\n💰 Payment: ENABLED (Coinbase x402)`);
    console.log(`   Network: base-sepolia`);
    console.log(`   Search News: ${PAYMENT_CONFIG.tools.search_news.price}`);
    console.log(`   Get News: ${PAYMENT_CONFIG.tools.get_news.price}`);
  } else {
    console.log(`\n💰 Payment: DISABLED (Configure .env to enable)`);
  }
  
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /                    - Server info and capabilities`);
  console.log(`   GET  /health              - Health check`);
  console.log(`   GET  /info                - Detailed information`);
  console.log(`\n🔧 MCP Protocol Endpoints:`);
  console.log(`   POST /mcp/initialize      - Initialize MCP connection`);
  console.log(`   GET  /mcp/tools           - List all tools`);
  console.log(`   GET  /mcp/prompts         - List all prompts`);
  console.log(`   GET  /mcp/resources       - List all resources`);
  console.log(`\n📰 News Agent Endpoints:`);
  console.log(`   GET  /news/search         - Search news ($1)`);
  console.log(`   GET  /news/latest         - Get latest news ($0.5)`);
  console.log(`\n📚 Examples:`);
  console.log(`   GET  /news/search?searchTerm=technology&pageSize=10`);
  console.log(`   GET  /news/latest?topic=sports&pageSize=5`);
  console.log("\n" + "=".repeat(60) + "\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});
