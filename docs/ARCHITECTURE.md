# Project Architecture & System Design

## 1. System Overview

**TaskOps** is a full-stack, DevOps-engineered Task Management platform with an automated Continuous Integration and Continuous Testing pipeline built on CircleCI.

The system is decoupled into three core tiers:
1. **Frontend Presentation Layer**: Built with React 18, Vite, and Tailwind CSS. Provides an intuitive dashboard, task statistics, interactive filtering, and a secure CI pipeline status modal.
2. **Backend Application Layer**: Built with Python and FastAPI. Implements RESTful CRUD endpoints for tasks, strict Pydantic schemas, database transactions, health probes, and a server-side CircleCI API proxy.
3. **Continuous Integration & Testing Engine**: Powered by CircleCI, Pytest, Ruff, and Vitest. Automates code checkout, caching, linting, regression testing, JUnit XML report generation, and artifact archiving.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Browser Tier"]
        UI["React + Vite UI (Port 5173 / 3000)"]
        Dashboard["Dashboard & Stats View"]
        TaskForm["Task Modal (Create/Edit)"]
        PipelineModal["CircleCI Status View"]
        UI --> Dashboard
        UI --> TaskForm
        UI --> PipelineModal
    end

    subgraph Backend ["FastAPI Application Tier (Port 8000)"]
        API["FastAPI ASGI App (Uvicorn)"]
        RouterTasks["Tasks Router (/tasks)"]
        RouterHealth["Health & Proxy Router (/health, /api/pipeline/status)"]
        Validation["Pydantic v2 Validation Schemas"]
        CRUD["SQLAlchemy 2.0 ORM CRUD Layer"]
        DB[(SQLite / Isolated Test Engine)]

        API --> RouterTasks
        API --> RouterHealth
        RouterTasks --> Validation
        Validation --> CRUD
        CRUD --> DB
    end

    subgraph CI ["Continuous Integration Tier (CircleCI 2.1)"]
        GitRepo["GitHub / Local Git Repository"]
        Trigger["Push / Pull Request Trigger"]
        JobBackend["Job: backend-test-and-lint"]
        JobFrontend["Job: frontend-build-and-test"]
        JobSummary["Job: pipeline-summary"]
        Reports["JUnit XML & Coverage Artifacts"]

        GitRepo --> Trigger
        Trigger --> JobBackend
        Trigger --> JobFrontend
        JobBackend --> JobSummary
        JobFrontend --> JobSummary
        JobBackend --> Reports
        JobFrontend --> Reports
    end

    UI -- HTTP REST --> API
    RouterHealth -. Secure Proxy (Token Kept Server-side) .-> CircleCI_API["CircleCI Cloud API v2"]
```

---

## 3. CI/CD Pipeline Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Developer
    participant Git as GitHub / Git SCM
    participant CircleCI as CircleCI Runner
    participant BackendJob as backend-test-and-lint
    participant FrontendJob as frontend-build-and-test
    participant SummaryJob as pipeline-summary

    Developer->>Git: git push origin feature/new-task-filter
    Git->>CircleCI: Webhook trigger (Push / PR)
    
    par Parallel Execution
        CircleCI->>BackendJob: Spin up cimg/python:3.11 container
        BackendJob->>BackendJob: Restore cache & install requirements-dev.txt
        BackendJob->>BackendJob: Run Ruff Linter (Style & Static Analysis)
        BackendJob->>BackendJob: Run Pytest (24 Unit/API tests + JUnit XML + Coverage)
        BackendJob->>CircleCI: Store Test Results (test-results/junit.xml)
        BackendJob->>CircleCI: Store Coverage Artifacts
    and
        CircleCI->>FrontendJob: Spin up cimg/node:20.18 container
        FrontendJob->>FrontendJob: Restore cache & npm ci
        FrontendJob->>FrontendJob: Run Vitest Unit Tests
        FrontendJob->>FrontendJob: Run Vite Production Build
        FrontendJob->>CircleCI: Store Test Results & Build Artifacts
    end

    alt Any Job Fails
        CircleCI-->>Git: Report Commit Check: FAILED ❌
        CircleCI-->>Developer: Send Failure Notification & Log Trace
    else All Parallel Jobs Pass
        BackendJob->>SummaryJob: Workflow Dependency Satisfied
        FrontendJob->>SummaryJob: Workflow Dependency Satisfied
        CircleCI->>SummaryJob: Execute pipeline-summary
        SummaryJob-->>CircleCI: Status: SUCCESS ✅
        CircleCI-->>Git: Report Commit Check: PASSED ✅
    end
```

---

## 4. Key Design Decisions

### A. Isolated Database Storage
- For production/development, the application uses SQLite (`tasks.db`), avoiding external heavy database dependencies while maintaining full ACID guarantees.
- For automated testing (`conftest.py`), SQLite in-memory with `StaticPool` is initialized fresh for every test run, guaranteeing 100% test isolation, eliminating flaky dependencies, and enabling rapid parallel execution (under 0.20 seconds for 24 test cases).

### B. Secure Pipeline Status Proxy
- Exposing CircleCI personal API tokens in the React client would pose a severe security vulnerability.
- To satisfy the optional pipeline monitoring requirement safely, the FastAPI backend provides a server-side proxy endpoint (`/api/pipeline/status`). The secret `CIRCLECI_TOKEN` remains on the server, and the frontend consumes sanitized JSON. If tokens are not set, a descriptive configuration prompt is returned without failing.

### C. JUnit XML Test Results Standardization
- CircleCI's native test dashboard parses JUnit-compatible XML test results.
- Pytest is configured via `pytest.ini` (`--junitxml=test-results/junit.xml`, `junit_family=xunit2`).
- Vitest is configured with `@vitest/junit-reporter` (`--reporter=junit --outputFile=test-results/junit.xml`).
- This enables CircleCI to highlight flaky tests, pinpoint failures per line of code, and compute execution metrics across builds.
