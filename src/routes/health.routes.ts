import { Router, Request, Response } from "express";
import { MCPServer } from "../server.js";
import { isPaymentConfigured, PAYMENT_CONFIG } from "../config/payment.config.js";

const router = Router();

// Root endpoint - Server info
router.get("/", (req: Request, res: Response) => {
  res.json({
    name: "SovereignSwarm SDK MCP Server",
    version: "1.0.0",
    status: "healthy",
    paymentEnabled: isPaymentConfigured(),
    endpoints: {
      initialize: "POST /mcp/initialize",
      tools: {
        list: "GET/POST /mcp/tools",
        calculate: "GET/POST /mcp/calculate",
        weather: "GET/POST /mcp/weather"
      },
      prompts: {
        list: "GET/POST /mcp/prompts"
      },
      resources: {
        list: "GET/POST /mcp/resources"
      },
      jsonRpc: "POST /mcp",
      health: "GET /health",
      info: "GET /info",
      news: {
        search: "GET /news/search",
        latest: "GET /news/latest"
      }
    },
    pricing: isPaymentConfigured() ? {
      search_news: PAYMENT_CONFIG.tools.search_news.price,
      get_news: PAYMENT_CONFIG.tools.get_news.price,
      jsonRpc: PAYMENT_CONFIG.jsonRpc.price,
      network: "base-sepolia"
    } : null,
    examples: {
      search_news: {
        get: "/news/search?searchTerm=technology&pageSize=10",
      },
      get_news: {
        get: "/news/latest?topic=sports&pageSize=5",
      }
    },
    capabilities: {
      tools: ["search_news", "get_news"],
      prompts: ["search_news_examples", "get_news_examples"],
      resources: ["newsagent://status"],
    },
  });
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Info endpoint
router.get("/info", (req: Request, res: Response) => {
  res.json({
    name: "News Agent MCP Server",
    version: "1.0.0",
    protocol: "Model Context Protocol",
    description: "MCP server providing news search and retrieval tools",
    paymentEnabled: isPaymentConfigured(),
    paymentNetwork: isPaymentConfigured() ? "base-sepolia" : null,
    capabilities: {
      tools: {
        search_news: "Search for news articles about a specific topic",
        get_news: "Get latest news headlines",
      },
      prompts: {
        search_news_examples: "Training examples for search_news tool usage",
        get_news_examples: "Training examples for get_news tool usage",
      },
      resources: {
        "newsagent://status": "News agent status and statistics",
      },
    },
    pricing: isPaymentConfigured() ? {
      tools: {
        search_news: PAYMENT_CONFIG.tools.search_news.price,
        get_news: PAYMENT_CONFIG.tools.get_news.price,
      },
      jsonRpc: PAYMENT_CONFIG.jsonRpc.price,
    } : null,
  });
});

export default router;
