# 🔍 RepoLens

> **Turn any codebase into a queryable, structured knowledge engine using GraphRAG.**

RepoLens moves beyond superficial semantic search and shallow autocompletions. By fusing **Retrieval-Augmented Generation (RAG)** with a **Code Knowledge Graph**, RepoLens maps out relationships, dependencies, and execution paths across an entire repository—giving developers instant structural comprehension of complex software systems.

---

## ⚡ The Problem

* **High Cognitive Load:** Ramping up on large repositories or contributing to new open-source projects requires days of manually tracing call stacks, imports, and cross-file dependencies.
* **Limitations of Standard Code AI:** Most assistants rely only on vector embeddings (finding text that *looks* similar) or shallow agentic reads. They struggle to grasp deep call chains and cross-module side effects.

---

## 💡 The Solution: Graph-Augmented Code Intelligence

RepoLens parses your source code into an **Abstract Syntax Tree (AST)**, mapping:
* **Nodes:** Functions, classes, interfaces, modules, and API endpoints.
* **Edges:** `calls`, `imports`, `implements`, `inherits`, and `references`.

When you query the codebase, RepoLens traverses the graph to ground LLM reasoning in structural reality—ensuring zero guesswork on execution flow and dependencies.

---

## 🚀 Key Features

* **Instant Open-Source Onboarding:** Paste any GitHub repository URL to immediately get an architectural breakdown, entry points, and component relationships without manual reading.
* **Blast Radius & Impact Analysis:** Ask *"What breaks if I change this function?"* and get an exact trace of every downstream module, endpoint, and test affected.
* **Living Architecture Diagrams:** Automatically generate dynamic dependency and sequence diagrams from the parsed graph.
* **Automated PR Reviews & QA:** Pinpoint missing tests and trace untested execution paths prior to merging.

---

## 🛠️ Architecture