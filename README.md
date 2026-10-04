# AI Software Engineering Assistant

> **Ship software with an AI agent that checks its work.**  
> Autonomous, self-correcting software engineering assistant powered by **LangGraph**, **FastAPI**, and a desktop-first **Next.js** developer workspace.

---

## Architecture Overview

```text
                    Next.js Frontend (Desktop-First Workspace)
                                   │
                           Server-Sent Events (SSE)
                                   │
                                   ▼
                       FastAPI Server & Task Service
                                   │
                                   ▼
                       LangGraph State Machine
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
      Planner             Repository Analyzer           Coding Agent
(Decomposes task)        (Indexes workspace files)    (Generates clean diffs)
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                              Test Agent
                    (Runs pytest in sandbox)
                                   │
                                   ▼
                           Reflection / Debug
                         (Diagnoses failure logs)
                                   │
                           ┌───────┴───────┐
                           │               │
                         FAIL             PASS
                           │               │
                           └──► Fix ───────┘
                                   │
                                   ▼
                        Final Unified Code Diff
                     (Awaiting User Human Review)
```

---

## Key Differentiators

Unlike generic chatbots that guess and apologize, the **AI Software Engineering Assistant** executes a closed-loop state machine:

1. **Planner Agent**: Analyzes requirements and formulates a 3-5 step architectural plan.
2. **Repository Analyzer**: Scans the workspace, indexes project dependencies, and detects existing test frameworks (`pytest`, `unittest`, etc.).
3. **Coding Agent**: Applies minimal, targeted code modifications with syntax checks and diff calculation.
4. **Test Agent**: Executes test suites inside an isolated subprocess with strict timeouts and sanitized environments.
5. **Reflection / Debug Agent**: When tests fail, diagnoses root cause errors, devises concrete repair instructions, and loops back into the Coding Agent (up to `max_iterations = 3`).
6. **Human-in-the-Loop Approval**: Allows users to inspect unified git diffs, review each iteration, and explicitly approve or reject changes.

---

## Repository Structure

```text
.
├── backend/
│   ├── agents/            # Planner, Analyzer, Coder, Tester, Reflector, LLM Factory
│   ├── api/               # FastAPI routes and SSE streaming endpoint
│   ├── execution/         # ExecutionManager for isolated test sandboxing
│   ├── graph/             # LangGraph StateGraph, memory saver, and conditional routing
│   ├── models/            # Pydantic schemas and AgentState TypedDict
│   ├── services/          # TaskService (async streaming) & ProjectService
│   ├── tests/             # Pytest backend test suite
│   └── run.py             # Backend server runner (port 8000)
├── frontend/
│   ├── src/app/           # Next.js App Router (Landing page & /workspace)
│   ├── src/components/    # WorkflowVisualizer, Timeline, DiffViewer, TestPanel, FileTree
│   ├── src/lib/           # API client and SSE streaming listener
│   └── src/types/          # TypeScript interfaces
├── sample_projects/
│   ├── fibonacci/         # Sample math utility project with pytest suite
│   └── palindrome/        # Sample palindrome validator with pytest suite
├── skills/                # Project skill registry (Taste, Impeccable, Emil Kowalski, UI/UX Pro Max)
├── task.md                # Full product specification
└── README.md
```

---

## Quick Start

### 1. Backend Setup

```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies (if not already installed)
pip install -r <(pip freeze)

# Optional: set LLM API key (works out of the box with heuristic runner if omitted)
# export MISTRAL_API_KEY="your-mistral-api-key"
# export OPENAI_API_KEY="your-openai-api-key"

# Run backend tests
PYTHONPATH=. pytest backend/tests/test_backend.py -v

# Start FastAPI server on port 8000
python backend/run.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- `/`: Product landing page with interactive execution pipeline and architecture overview.
- `/workspace`: Desktop-first developer workspace featuring:
  - Repository Explorer & File Tree viewer
  - Active Task Plan review card
  - Unified Diff Viewer with syntax-highlighted additions/deletions
  - Interactive LangGraph Workflow Visualizer
  - Real-time Agent Execution Timeline (streamed via SSE)
  - Sandbox Test Results panel

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/projects` | List registered project workspaces |
| `GET` | `/api/projects/{id}/files` | Retrieve hierarchical file tree |
| `GET` | `/api/projects/{id}/files/{path}` | Read specific file content |
| `POST` | `/api/tasks` | Create and start an autonomous agent task |
| `GET` | `/api/tasks/{id}` | Get task state, plan, diffs, and test results |
| `GET` | `/api/tasks/{id}/events` | Server-Sent Events (SSE) live event stream |
| `GET` | `/api/tasks/{id}/diff` | Unified diff of proposed changes |
| `POST` | `/api/tasks/{id}/approve-changes` | User accepts proposed changes |
| `POST` | `/api/tasks/{id}/reject-changes` | User rejects proposed changes |
| `POST` | `/api/tasks/{id}/cancel` | Cancel running task |
