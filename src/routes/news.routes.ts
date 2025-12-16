import { Router, Request, Response } from "express";
import { MCPServer } from "../server.js";
import {  getFacilitatorUrl, getPaymentAddress, isPaymentConfigured } from "../config/payment.config.js";

const router = Router();


// Search News - GET only
router.get("/search_news", async (req: Request, res: Response) => {
  console.log("🔧 GET /news/search");
  const { searchTerm, pageSize } = req.query;
  
  if (!searchTerm) {
    return res.status(400).json({
      error: "Missing searchTerm parameter",
      example: "/news/search?searchTerm=technology&pageSize=15"
    });
  }

  const mcpServer = new MCPServer();
  
  try {
    const mcpResult = await mcpServer.callTool("search_news", {
      searchTerm: searchTerm as string,
      pageSize: pageSize ? parseInt(pageSize as string) : 15
    });
    
    // Extract the actual result from MCP format
    const textContent = mcpResult.content[0].text;
    const result = JSON.parse(textContent);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to search news",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get Latest News - GET only
router.get("/get_news", async (req: Request, res: Response) => {
  console.log("🔧 GET /news/get_news");
  const { topic, pageSize } = req.query;

  const mcpServer = new MCPServer();
  
  try {
    const mcpResult = await mcpServer.callTool("get_news", {
      topic: topic as string | undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : 10
    });
    
    // Extract the actual result from MCP format
    const textContent = mcpResult.content[0].text;
    const result = JSON.parse(textContent);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch news",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
