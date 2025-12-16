import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";


/**
 * 
 * FluidSDK MCP Server Core
 * Provides tools, prompts, and resources for AI agents
 */
export class MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "fluidsdk-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_news",
            description: "Search for news articles about a specific topic with enhanced filtering",
            inputSchema: {
              type: "object",
              properties: {
                searchTerm: {
                  type: "string",
                  description: "The topic or keyword to search for",
                },
                pageSize: {
                  type: "number",
                  description: "Number of articles to return (max 50)",
                  default: 15,
                },
              },
              required: ["searchTerm"],
            },
          },
          {
            name: "get_news",
            description: "Get the latest news headlines, optionally filtered by topic",
            inputSchema: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  description: "Optional topic to filter news by",
                },
                pageSize: {
                  type: "number",
                  description: "Number of articles to return (max 50)",
                  default: 10,
                },
              },
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "search_news":
          return await this.handleSearchNews(args as any);
        case "get_news":
          return await this.handleGetNews(args as any);
        default:
          return {
            content: [
              {
                type: "text",
                text: `Error: Unknown tool ${name}`,
              },
            ],
          };
      }
    });

    // Prompts Handler
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "search_news_examples",
            description: "Training examples for search_news tool - shows how users request news search",
            arguments: [],
          },
          {
            name: "get_news_examples",
            description: "Training examples for get_news tool - shows how users request latest headlines",
            arguments: [],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "search_news_examples":
          return this.handleSearchNewsExamples();
        case "get_news_examples":
          return this.handleGetNewsExamples();
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });

    // Resources Handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "newsagent://status",
            name: "News Agent Status",
            description: "Current news agent status and statistics",
            mimeType: "application/json",
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "newsagent://status":
          return this.handleNewsStatusResource();
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  // Handler Methods
  private handleSearchNewsExamples() {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: JSON.stringify({
              tool: "search_news",
              description: "Training examples for AI agent - search news conversations",
              examples: [
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what's the latest news about <searchTerm>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "can you show me the latest news about <searchTerm>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "search for news about <searchTerm>" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "find articles about <searchTerm>" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what's happening with <searchTerm>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "show me current events about <searchTerm>" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what's going on in the world of <searchTerm>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "tell me about <searchTerm> news" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "SEARCH_NEWS", tool: "search_news", params: { searchTerm: "<searchTerm>" } }
                  }
                ]
              ]
            }, null, 2)
          }
        }
      ]
    };
  }

  private handleGetNewsExamples() {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: JSON.stringify({
              tool: "get_news",
              description: "Training examples for AI agent - get latest news conversations",
              examples: [
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what's in the <topic> news today?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "give me the latest headlines about <topic>" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "show me news updates about <topic>" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what are today's top stories about <topic>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "get me the latest <topic> headlines" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what's the latest in <topic>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "show me today's <topic> news" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "what's new in <topic>?" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: { topic: "<topic>" } }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "get latest news" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: {} }
                  }
                ],
                [
                  {
                    user: "{{user1}}",
                    content: { text: "show me top headlines" }
                  },
                  {
                    user: "{{agent}}",
                    content: { text: "", action: "GET_NEWS", tool: "get_news", params: {} }
                  }
                ]
              ]
            }, null, 2)
          }
        }
      ]
    };
  }

  private handleNewsStatusResource() {
    const api = process.env.NEWS_API_KEY!
    return {
      contents: [
        {
          uri: "newsagent://status",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              name: "news-agent",
              status: "operational",
              apiConfigured: !!api,
              uptime: process.uptime(),
              availableTools: ["search_news", "get_news"],
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleSearchNews(args: { searchTerm: string; pageSize?: number }) {
    const { searchTerm, pageSize = 15 } = args;
    const api = process.env.NEWS_API_KEY!
    if (!api) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "NEWS_API_KEY environment variable is not set",
            }, null, 2),
          },
        ],
      };
    }

    try {
      const enhancedSearchTerm = encodeURIComponent(`"${searchTerm}"`);
      const maxResults = Math.min(pageSize, 50);

      const [everythingResponse, headlinesResponse] = await Promise.all([
        fetch(
          `https://newsapi.org/v2/everything?q=${enhancedSearchTerm}&sortBy=relevancy&language=en&pageSize=${maxResults}&apiKey=${api}`
        ),
        fetch(
          `https://newsapi.org/v2/top-headlines?q=${searchTerm}&language=en&pageSize=${maxResults}&apiKey=${api}`
        )
      ]);

      const [everythingData, headlinesData] = await Promise.all([
        everythingResponse.json() as Promise<any>,
        headlinesResponse.json() as Promise<any>
      ]);

      // Combine and filter articles
      const allArticles = [
        ...(headlinesData.articles || []),
        ...(everythingData.articles || [])
      ].filter((article: any) =>
        article.title &&
        article.description &&
        (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         article.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Remove duplicates
      const uniqueArticles = Array.from(
        new Map(allArticles.map((article: any) => [article.title, article])).values()
      ).slice(0, Math.min(pageSize, 15));

      if (!uniqueArticles.length) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                searchTerm,
                articles: [],
                message: "No news articles found.",
              }, null, 2),
            },
          ],
        };
      }

      const formattedArticles = uniqueArticles.map((article: any, index: number) => {
        const content = article.description || 'No content available';
        const urlDomain = article.url ? new URL(article.url).hostname : '';
        return {
          index: index + 1,
          title: article.title || 'No title',
          description: content,
          source: urlDomain,
          url: article.url,
          publishedAt: article.publishedAt,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              searchTerm,
              totalResults: formattedArticles.length,
              articles: formattedArticles,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Failed to fetch news",
              message: error instanceof Error ? error.message : String(error),
            }, null, 2),
          },
        ],
      };
    }
  }

  private async handleGetNews(args: { topic?: string; pageSize?: number }) {
    const { topic, pageSize = 10 } = args;
    console.log("Handling get_news with topic:", topic, "and pageSize:", pageSize);
    const api = process.env.NEWS_API_KEY!
    if (!api) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "NEWS_API_KEY environment variable is not set",
            }, null, 2),
          },
        ],
      };
    }

    try {
      const maxResults = Math.min(pageSize, 50);
      let url = `https://newsapi.org/v2/everything?q=${topic||"crypto"}&apiKey=${api}`;
      
      if (topic) {
        url += `&q=${encodeURIComponent(topic)}`;
      }

      const response = await fetch(url);
      const data: any = await response.json();

      if (!data.articles || data.articles.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                topic: topic || "general",
                articles: [],
                message: "No news articles found.",
              }, null, 2),
            },
          ],
        };
      }

      const formattedArticles = data.articles.slice(0, pageSize).map((article: any, index: number) => {
        const urlDomain = article.url ? new URL(article.url).hostname : '';
        return {
          index: index + 1,
          title: article.title || 'No title',
          description: article.description || 'No description available',
          source: urlDomain,
          url: article.url,
          publishedAt: article.publishedAt,
        };
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              topic: topic || "general",
              totalResults: formattedArticles.length,
              articles: formattedArticles,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Failed to fetch news",
              message: error instanceof Error ? error.message : String(error),
            }, null, 2),
          },
        ],
      };
    }
  }

  getServer(): Server {
    return this.server;
  }

  getServerInfo() {
    return {
      name: "news-agent-mcp-server",
      version: "1.0.0"
    };
  }

  getTools() {
    return [
      {
        name: "search_news",
        description: "Search for news articles about a specific topic with enhanced filtering",
        inputSchema: {
          type: "object",
          properties: {
            searchTerm: {
              type: "string",
              description: "The topic or keyword to search for",
            },
            pageSize: {
              type: "number",
              description: "Number of articles to return (max 50)",
            },
          },
          required: ["searchTerm"],
        },
      },
      {
        name: "get_news",
        description: "Get the latest news headlines, optionally filtered by topic",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Optional topic to filter news by",
            },
            pageSize: {
              type: "number",
              description: "Number of articles to return (max 50)",
            },
          },
          required: [],
        },
      },
    ];
  }

  getPrompts() {
    return [
      {
        name: "search_news_examples",
        description: "Training examples for search_news tool - shows how users request news search",
        arguments: [],
      },
      {
        name: "get_news_examples",
        description: "Training examples for get_news tool - shows how users request latest headlines",
        arguments: [],
      },
    ];
  }

  getResources() {
    return [
      {
        uri: "newsagent://status",
        name: "News Agent Status",
        description: "Current news agent status and statistics",
        mimeType: "application/json",
      },
    ];
  }

  async callTool(name: string, args: any) {
    switch (name) {
      case "search_news":
        return await this.handleSearchNews(args);
      case "get_news":
        return await this.handleGetNews(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
