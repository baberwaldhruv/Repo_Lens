const path = require("path");
const express = require("express");
const { clone_repo, cleanupRepo } = require("./services/gitservices");
const { scanFiles } = require("./services/file_services");
const { parseFile } = require("./services/parseService");
const { getBlastRadius } = require("./services/graphService");

const app = express();
const port = 8080;

app.use(express.json());

// In-memory cache for the latest analyzed repository
let latestGraphData = {
  repo_url: null,
  totalFiles: 0,
  nodes: [],
  edges: [],
};

app.get("/health", (req, res) => {
  res.send("The home is healthy");
});

app.post("/analyze", async (req, res) => {
  const { repo_url } = req.body;

  if (!repo_url) {
    return res.status(400).json({ error: "Please provide a repo_url" });
  }

  if (!repo_url.includes("github.com")) {
    return res.status(400).json({
      error: "Invalid URL. Please provide a valid GitHub repository link.",
    });
  }

  let folderPath = null;

  try {
    console.log("Cloning repository...");
    folderPath = await clone_repo(repo_url);

    console.log("Scanning files...");
    const files = await scanFiles(folderPath);
    console.log(`Discovered ${files.length} code files.`);

    console.log("Parsing AST and extracting symbols...");
    const nodes = [];
    const declaredFunctions = new Set();
    const fileCallMappings = [];
    for (const filePath of files) {
      const parsed = await parseFile(filePath);
      const relativePath = path.relative(folderPath, filePath);

      for (const fn of parsed.functions) {
        declaredFunctions.add(fn);
        nodes.push({
          id: `${relativePath}:${fn}`,
          name: fn,
          file: relativePath,
          type: "function",
        });
      }

      fileCallMappings.push({
        file: relativePath,
        functions: parsed.functions,
        calls: parsed.calls,
      });
    }
    const edges = [];
    for (const item of fileCallMappings) {
      for (const call of item.calls) {
        if (declaredFunctions.has(call)) {
          if (item.functions.length > 0) {
            for (const fn of item.functions) {
              if (fn !== call) {
                edges.push({
                  from: fn,
                  to: call,
                  file: item.file,
                  relation: "CALLS",
                });
              }
            }
          } else {
            // Module-level invocation
            edges.push({
              from: item.file,
              to: call,
              relation: "CALLS",
            });
          }
        }
      }
    }

    // Remove duplicates from edges
    const uniqueEdgeMap = new Map();
    for (const edge of edges) {
      const key = `${edge.from}->${edge.to}`;
      if (!uniqueEdgeMap.has(key)) {
        uniqueEdgeMap.set(key, edge);
      }
    }
    const uniqueEdges = Array.from(uniqueEdgeMap.values());

    await cleanupRepo(folderPath);
    console.log("Cloned repository deleted from disk.");
    latestGraphData = {
      repo_url,
      totalFiles: files.length,
      nodes,
      edges: uniqueEdges,
    };

    return res.json({
      message: "Repository analyzed and graph generated successfully",
      repo_url,
      totalFiles: files.length,
      totalNodes: nodes.length,
      totalEdges: uniqueEdges.length,
      nodes,
      edges: uniqueEdges,
    });
  } catch (err) {
    console.error("Analysis pipeline error:", err);

    if (folderPath) {
      await cleanupRepo(folderPath);
    }

    return res.status(500).json({ error: "Failed to analyze repository" });
  }
});
app.post("/query", (req, res) => {
  const { symbol, maxDepth } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: "Please provide a 'symbol' to query" });
  }

  if (latestGraphData.edges.length === 0) {
    return res.status(400).json({
      error: "No indexed repository found. Run POST /analyze first.",
    });
  }

  const depthLimit = maxDepth ? parseInt(maxDepth, 10) : 3;
  const blastRadiusResult = getBlastRadius(symbol, latestGraphData.edges, depthLimit);

  return res.json({
    repo_url: latestGraphData.repo_url,
    ...blastRadiusResult,
  });
});

app.listen(port, () => {
  console.log(`The server is listening to port ${port}`);
});