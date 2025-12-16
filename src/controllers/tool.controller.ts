import { MCPServer } from "../server.js";

export class ToolController {
  private mcpServer: MCPServer;

  constructor() {
    this.mcpServer = new MCPServer();
  }

  async searchNews(searchTerm: string, pageSize: number = 15) {
    return await this.mcpServer.callTool("search_news", { searchTerm, pageSize });
  }

  async getNews(topic?: string, pageSize: number = 10) {
    return await this.mcpServer.callTool("get_news", { topic, pageSize });
  }
}
