# AI Software Engineering Assistant — Task Specification

## 1. Project Objective

Transform the existing LangGraph **Code Assistant with self-correction** prototype into a polished web application called:

**AI Software Engineering Assistant**

The application should allow a developer to submit a coding task and have an agent workflow:

1. Understand the task
2. Analyze the project/repository
3. Generate or modify code
4. Run checks/tests
5. Inspect failures
6. Iteratively correct the implementation
7. Present the final result and code changes to the user

The existing LangGraph generate → check/execute → retry workflow is the foundation. Do not discard it and replace it with a generic chatbot.

---

# 2. Product Vision

This should feel like a lightweight combination of:

- ChatGPT
- Cursor-style coding assistance
- GitHub workflow
- Agent execution/observability UI

The application should **show the agent working**, rather than hiding everything behind a chat response.

Core user flow:

```text
Landing Page
     ↓
Start Building
     ↓
Workspace
     ↓
Select / upload repository
     ↓
Describe coding task
     ↓
Generate plan
     ↓
Run agent workflow
     ↓
Generate / modify code
     ↓
Run tests
     ↓
Self-correct if needed
     ↓
Show final diff + test result
     ↓
User accepts/rejects changes
```

---

# 3. MVP Scope

## P0 — Must Have

### Frontend

- Landing page
- Workspace page
- Chat interface
- Repository/project panel
- Agent workflow/status panel
- Agent activity timeline
- Task history
- Code/diff viewer
- Test result panel
- Loading/streaming states
- Error states
- Responsive desktop-first layout

### Backend

- FastAPI API server
- LangGraph workflow
- Session/task state
- Streaming agent events to frontend
- Existing code-generation workflow integrated into backend
- Basic repository/file access
- Code execution through a controlled mechanism
- Test execution
- Iteration limit
- Final result API

### Agent workflow

Initial workflow:

```text
User Task
   ↓
Planner
   ↓
Repository Analyzer
   ↓
Coding Agent
   ↓
Test / Code Check
   ↓
Reflection / Debug
   ↓
Coding Agent
   ↺
   ↓
Success / Max Iterations
   ↓
Final Result
```

Do not create fake agents that only change prompts. Each node must have a distinct responsibility and produce structured state.

---

# 4. UI Requirements

## 4.1 Landing Page

Create a premium developer-tool landing page.

### Hero

Headline:

> Ship software with an AI agent that checks its work.

Supporting copy:

> Plan, implement, test, debug, and refine software tasks through an autonomous LangGraph workflow.

Primary CTA:

**Start Building**

Secondary CTA:

**View Architecture**

### Hero visualization

Use an animated or interactive workflow:

```text
PLAN → ANALYZE → CODE → TEST → REFLECT ↺
```

Avoid generic AI robot illustrations.

### Landing page sections

- Hero
- How it works
- Agent workflow
- Key capabilities
- Example task
- Architecture
- CTA / footer

Keep the page focused. Avoid excessive marketing sections.

---

# 5. Workspace UI

The workspace is the main product.

Recommended layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo     Project Name                         GitHub Settings│
├───────────────┬───────────────────────────┬─────────────────┤
│               │                           │                 │
│ Repository    │       Chat / Task         │ Agent Workflow  │
│               │                           │                 │
│ Files         │ User request              │ ✓ Planner       │
│               │                           │ ✓ Analyzer      │
│ Recent tasks  │ Agent response            │ ● Coder        │
│               │                           │ ○ Tester        │
│               │ Activity timeline          │ ○ Reflection    │
│               │                           │                 │
│               │ Code / Diff               │ Test Results    │
│               │                           │                 │
│               │ Input box                 │ Iteration 2/3   │
└───────────────┴───────────────────────────┴─────────────────┘
```

### Left panel

Show:

- Project name
- Repository name/path
- File tree
- Recent tasks
- Current task status

### Center panel

Primary area:

- Chat
- Agent messages
- Plan
- Activity timeline
- Code changes
- Diff viewer

### Right panel

Show:

- Current agent node
- Completed nodes
- Pending nodes
- Current iteration
- Test status
- Errors
- Execution logs

---

# 6. Agent Workflow Visualization

This is a major differentiator.

Show:

```text
✓ Planner
   ↓
✓ Repository Analyzer
   ↓
● Coding Agent
   ↓
○ Test Agent
   ↓
○ Reflection Agent
```

Update the visualization live.

Clicking a node should reveal:

- What it did
- Input
- Output
- Files touched
- Tool calls
- Test results
- Error details

Do not expose private chain-of-thought. Show concise execution metadata, actions, observations, and results instead.

---

# 7. Agent Activity Timeline

Example:

```text
09:41:03  ✓ Planner
          Generated 5-step implementation plan

09:41:07  ✓ Repository Analyzer
          Inspected 34 files

09:41:15  ✓ Coding Agent
          Modified src/auth/service.py

09:41:22  ● Test Agent
          Running pytest

09:41:28  ✗ Test Agent
          2 tests failed

09:41:30  ● Reflection Agent
          Analyzing test failures

09:41:35  ● Coding Agent
          Applying correction

09:41:44  ✓ Test Agent
          49/49 tests passed

09:41:45  ✓ Completed
```

---

# 8. Repository Support

## MVP

Support a local project/workspace.

Capabilities:

- List files
- Read file
- Search files
- Inspect project structure
- Detect language/framework
- Identify tests
- Read configuration files

The architecture should make it possible to add GitHub later.

## Phase 2

Add GitHub integration:

- Connect repository
- Clone repository
- Checkout branch
- Create branch
- Show git diff
- Commit changes
- Create pull request
- Show PR status

Do not block MVP development on GitHub OAuth.

---

# 9. Coding Tools

Create explicit tools instead of allowing the LLM to directly manipulate the filesystem without control.

Suggested tools:

```text
list_files()
read_file(path)
search_repository(query)
write_file(path, content)
apply_patch(path, patch)
run_command(command)
run_tests()
get_git_diff()
```

Every tool should have:

- Input schema
- Validation
- Error handling
- Structured output
- Timeout
- Logging

---

# 10. Code Execution Safety

Generated code must NOT execute directly in the main application process.

Preferred approach:

```text
FastAPI
   ↓
Execution Manager
   ↓
Docker Sandbox
   ↓
Generated Project
   ↓
Tests / Commands
```

Add:

- Timeout
- Memory/process limits where practical
- Restricted filesystem access
- No host secrets
- No unrestricted network access by default

For MVP, a controlled local execution adapter is acceptable if clearly isolated and documented.

---

# 11. LangGraph State

Use explicit structured state.

Suggested state:

```python
class AgentState:
    task: str
    repository_context: dict
    plan: list
    messages: list
    generated_changes: list
    test_results: dict
    errors: list
    iteration: int
    max_iterations: int
    status: str
```

Keep state serializable.

Possible statuses:

```text
planning
analyzing
coding
testing
debugging
completed
failed
awaiting_approval
```

---

# 12. Agent Responsibilities

## Planner

Input:

- User task

Output:

- Structured implementation plan

Example:

```text
1. Inspect authentication module
2. Add password hashing
3. Add JWT token generation
4. Add protected route
5. Add tests
```

## Repository Analyzer

Find:

- Relevant files
- Existing implementations
- Dependencies
- Existing tests
- Potential integration points

## Coding Agent

- Generate changes
- Use repository context
- Prefer minimal targeted modifications
- Return structured change information

## Test Agent

- Detect available test framework
- Run appropriate tests
- Return:
  - command
  - exit code
  - passed
  - failed
  - output
  - duration

## Reflection / Debug Agent

Given a failure:

- Identify likely cause
- Determine correction
- Return actionable fix instructions

Do not expose hidden reasoning. Return only a concise diagnosis and action.

---

# 13. Self-Correction Loop

The original project already contains the core concept of:

```text
Generate
   ↓
Check / Execute
   ↓
Error?
 ┌─┴─┐
Yes No
 │   │
 ▼   ▼
Fix  Finish
 │
 └──→ Generate
```

Preserve this behavior and make it visible in the UI.

Start with:

```text
max_iterations = 3
```

Later make the limit configurable.

Prevent infinite loops.

---

# 14. Human-in-the-Loop

The user should not be forced to accept automatic changes.

Recommended flow:

```text
Task
 ↓
Plan
 ↓
User approves plan
 ↓
Implementation
 ↓
Testing
 ↓
Self-correction
 ↓
Final diff
 ↓
User reviews
 ↓
Accept / Reject
```

Add:

- Approve plan
- Cancel task
- Review changes
- Accept changes
- Reject changes

Autonomous mode can be added later.

---

# 15. ReAct / Tool-Using Layer

The base project is not a pure ReAct implementation.

Do not falsely label it as ReAct.

For the upgraded version, a tool-using agent can dynamically select:

```text
read_file
search_repository
run_tests
get_git_diff
write_file
search_docs
```

Conceptually:

```text
Agent
 ↓
Select tool
 ↓
Observe tool result
 ↓
Select next tool
 ↓
Execute
 ↓
Test
 ↓
Reflect
```

Implement this only after the deterministic LangGraph workflow is stable.

---

# 16. Recommended Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Monaco Editor or another mature code editor
- Lucide icons
- SSE or WebSocket streaming

## Backend

- Python
- FastAPI
- LangGraph
- LangChain
- Pydantic

## Persistence

MVP:

- SQLite or PostgreSQL

Optional:

- Redis for streaming/task coordination

## Execution

- Docker

## LLM

Make the model provider configurable through environment variables.

Do not hardcode a single model into the architecture.

---

# 17. API Design

Suggested endpoints:

```text
POST   /api/projects
GET    /api/projects/{id}
GET    /api/projects/{id}/files
GET    /api/projects/{id}/files/{path}

POST   /api/tasks
GET    /api/tasks/{id}
POST   /api/tasks/{id}/approve-plan
POST   /api/tasks/{id}/cancel
POST   /api/tasks/{id}/approve-changes
POST   /api/tasks/{id}/reject-changes

GET    /api/tasks/{id}/events
GET    /api/tasks/{id}/diff
GET    /api/tasks/{id}/tests
```

For live execution events, prefer:

```text
GET /api/tasks/{id}/events
```

using SSE for the first implementation.

---

# 18. Data Model

Minimum entities:

### Project

```text
id
name
path
language
framework
created_at
```

### Task

```text
id
project_id
title
description
status
iteration
max_iterations
created_at
completed_at
```

### AgentEvent

```text
id
task_id
node
status
message
metadata
timestamp
```

### FileChange

```text
id
task_id
path
change_type
diff
```

### TestRun

```text
id
task_id
command
status
passed
failed
output
duration
```

---

# 19. UI Design Direction

Target aesthetic:

**Premium developer tool / AI infrastructure product**

Use:

- Dark-first interface
- Strong typography
- Tight spacing
- Clear hierarchy
- Subtle borders
- Restrained accent color
- Monospace typography for code/logs
- Smooth but understated animations

Avoid:

- Excessive gradients
- Glowing sci-fi UI
- Giant robot graphics
- Excessive rounded cards
- Fake metrics
- Decorative elements with no function

The UI should look like a serious developer product.

---

# 20. Observability

At MVP, every workflow step should emit structured events.

Example:

```json
{
  "node": "test_agent",
  "status": "failed",
  "iteration": 2,
  "duration_ms": 4210,
  "tests_passed": 47,
  "tests_failed": 2
}
```

These events power the workflow UI and make debugging easier.

---

# 21. Error Handling

The UI must handle:

- LLM timeout
- LLM API error
- Invalid model response
- Tool failure
- File not found
- Test command failure
- Sandbox timeout
- Max iterations reached
- Invalid patch
- User cancellation

Never leave the interface stuck in an infinite loading state.

---

# 22. Testing

Create tests for:

### Backend

- LangGraph node behavior
- State transitions
- Tool validation
- API endpoints
- Error handling

### Agent

- Successful task
- Recoverable test failure
- Multiple iterations
- Max iteration handling
- No-change response

### Frontend

- Task submission
- Event streaming
- Workflow status updates
- Diff rendering
- Error states

---

# 23. Development Phases

## Phase 1 — Foundation

- [ ] Inspect existing Code Assistant implementation
- [ ] Extract reusable LangGraph logic
- [ ] Create FastAPI backend
- [ ] Create Next.js frontend
- [ ] Establish frontend/backend communication
- [ ] Add basic project/session model

## Phase 2 — Product UI

- [ ] Build landing page
- [ ] Build workspace shell
- [ ] Build chat UI
- [ ] Build repository panel
- [ ] Build workflow panel
- [ ] Build activity timeline
- [ ] Build test result panel
- [ ] Build diff viewer

## Phase 3 — Agent Integration

- [ ] Integrate Planner
- [ ] Integrate Repository Analyzer
- [ ] Integrate Coding Agent
- [ ] Integrate Test Agent
- [ ] Integrate Reflection Agent
- [ ] Implement self-correction loop
- [ ] Implement SSE event streaming

## Phase 4 — Developer Tools

- [ ] list_files
- [ ] read_file
- [ ] search_repository
- [ ] write_file
- [ ] apply_patch
- [ ] run_tests
- [ ] get_git_diff

## Phase 5 — Safety & Reliability

- [ ] Docker execution
- [ ] Command validation
- [ ] Timeouts
- [ ] Iteration limits
- [ ] Failure recovery
- [ ] Structured logging

## Phase 6 — Human Approval

- [ ] Plan approval
- [ ] Task cancellation
- [ ] Review changes
- [ ] Accept changes
- [ ] Reject changes

## Phase 7 — Optional Advanced Features

- [ ] ReAct-style tool selection
- [ ] GitHub integration
- [ ] Branch creation
- [ ] Pull request creation
- [ ] Documentation retrieval
- [ ] Persistent task history
- [ ] LangSmith tracing
- [ ] Authentication
- [ ] Multi-project support

---

# 24. Definition of Done — MVP

The MVP is complete when a user can:

1. Open the landing page
2. Enter the workspace
3. Select/load a project
4. Describe a coding task
5. See an implementation plan
6. Start the agent workflow
7. See live workflow state
8. See repository analysis
9. See generated code changes
10. Run tests
11. See failures
12. See a correction iteration
13. See successful tests or a clear failure state
14. Inspect the final diff
15. Approve or reject the changes

A task should be demonstrable end-to-end without requiring notebook interaction.

---

# 25. Non-Goals for MVP

Do NOT initially build:

- Full IDE replacement
- Voice assistant
- Image generation
- Ten+ independent agents
- Complex enterprise authentication
- Kubernetes deployment
- Distributed worker infrastructure
- General web-search agent
- Huge analytics dashboard

Focus on the core loop:

**Task → Plan → Analyze → Code → Test → Reflect → Fix → Result**

---

# 26. Project Quality Requirements

The codebase should be:

- Modular
- Typed where practical
- Documented
- Environment-variable driven
- Easy to run locally
- Easy to extend
- Free of hardcoded secrets
- Covered by meaningful tests

Keep frontend and backend clearly separated.

Use conventional naming and folder structures.

Do not perform a massive rewrite before understanding the existing implementation.
