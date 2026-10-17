const express = require("express");
const { clone_repo, cleanupRepo } = require("./services/gitservices");
const { scanFiles } = require("./services/file_services");

const app = express();

const port = 8080;
app.use(express.json());

app.listen(port, () => {
  console.log(`The server is listening to port ${port}`);
});

app.get("/health", (req, res) => {
  res.send("The home is healthy");
});

app.post("/analyze", async (req, res) => {
  const { repo_url } = req.body;
  console.log(repo_url);
  if (!repo_url) {
    return res.status(400).json({
      error: "Please provide a repo_url",
    });
  }
  if (!repo_url.includes("github.com")) {
    return res.status(400).json({
      error: "Invalid URL. Please provide a valid GitHub repository link.",
    });
  }
  try {
    console.log("cloning Repo");
    const folderPath = await clone_repo(repo_url);
    const files = await scanFiles(folderPath);
    console.log(files);
    await cleanupRepo(folderPath);
    res.json({
      message: "Repository is received and verified successfully",
      repo_url: repo_url,
      totalFiles: files.length,
      files: files,
    });
  } catch (err) {
    console.error("Clone error:", err);
    res.status(500).json({ error: "Failed to clone repository" });
  }
});
