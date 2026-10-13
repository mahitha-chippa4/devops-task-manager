# CircleCI Continuous Integration & Testing Pipeline Guide

## 1. Pipeline Architecture

The project continuous integration pipeline is defined in `.circleci/config.yml` using the CircleCI 2.1 configuration specification.

It orchestrates three distinct jobs connected via a DAG (Directed Acyclic Graph) workflow:

```
                  ┌────────────────────────────┐
                  │   Git Push / Pull Request  │
                  └──────────────┬─────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌───────────────────────────┐  ┌───────────────────────────┐
    │   backend-test-and-lint   │  │  frontend-build-and-test  │
    │  - Python 3.11 Container  │  │  - Node 20 Container      │
    │  - Dependency Caching     │  │  - Dependency Caching     │
    │  - Ruff Code Quality      │  │  - Vitest Unit Tests      │
    │  - 24 Pytest Test Cases   │  │  - Vite Production Build  │
    │  - JUnit XML & Coverage   │  │  - JUnit XML & Dist Art.  │
    └─────────────┬─────────────┘  └─────────────┬─────────────┘
                  │                              │
                  └──────────────┬───────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │    pipeline-summary     │
                    │   (Requires Both Jobs)  │
                    │   Confirms Build Pass   │
                    └─────────────────────────┘
```

---

## 2. Job Specifications

### Job 1: `backend-test-and-lint`
- **Executor**: Official CircleCI Docker convenience image `cimg/python:3.11`.
- **Cache Strategy**:
  - Key: `v1-backend-deps-{{ checksum "backend/requirements-dev.txt" }}`
  - Fallback: `v1-backend-deps-`
- **Quality Checks**:
  - `ruff check app tests` — validates syntax, unused imports, error handling patterns, and code hygiene.
- **Test Execution**:
  - Pytest runs against all files in `backend/tests/`.
  - Flags: `--junitxml=test-results/junit.xml --cov=app --cov-report=xml:test-results/coverage.xml`.
- **Result & Artifact Storage**:
  - `store_test_results`: uploads test metadata for the CircleCI Test Insights tab.
  - `store_artifacts`: archives HTML/XML coverage reports.

### Job 2: `frontend-build-and-test`
- **Executor**: Official CircleCI Docker convenience image `cimg/node:20.18`.
- **Cache Strategy**:
  - Key: `v1-frontend-deps-{{ checksum "frontend/package.json" }}`
  - Fallback: `v1-frontend-deps-`
- **Unit Testing**:
  - Vitest runs test suites in non-interactive CI mode.
  - Generates JUnit-compatible `frontend/test-results/junit.xml`.
- **Production Build**:
  - Executes `npm run build` with Vite, ensuring no broken imports, TypeScript/JSX syntax errors, or bundle regressions.
- **Result & Artifact Storage**:
  - `store_test_results`: uploads Vitest test results.
  - `store_artifacts`: uploads production `dist/` bundle.

### Job 3: `pipeline-summary`
- **Executor**: `cimg/base:stable`.
- **Dependency**: Configured with `requires: [backend-test-and-lint, frontend-build-and-test]`.
- **Role**: Gatekeeper. If either backend or frontend job fails, `pipeline-summary` will NOT trigger, marking the entire commit status as failed on GitHub.

---

## 3. Failure Handling & Quality Gates

DevOps best practices require pipelines to **fail fast and loudly**:
1. **Linter Failures**: If code formatting or syntax fails Ruff validation, the job terminates at step 4, preventing unnecessary test execution on broken syntax.
2. **Assertion Failures**: If any Pytest test case fails (e.g. status code mismatch, validation regression), Pytest returns exit code `1`. CircleCI halts the job and highlights the failing test in red on the UI.
3. **Build Errors**: If a frontend import is missing or CSS cannot compile, `npm run build` exits with non-zero status.
4. **Pull Request Blocking**: When integrated with GitHub Branch Protection, merging is prevented until all jobs in `ci-pipeline` report `SUCCESS`.

---

## 4. Connecting Your Repository to CircleCI

Follow these steps to connect this project to CircleCI Cloud:

### Step 1: Create a GitHub Repository
```bash
# In the project root:
git remote add origin https://github.com/<your-username>/devops-task-manager.git
git branch -M main
git push -u origin main
```

### Step 2: Log into CircleCI
1. Go to [https://app.circleci.com](https://app.circleci.com).
2. Log in with your **GitHub account**.
3. Under **Projects**, find `devops-task-manager` and click **Set Up Project**.
4. Choose **Fast: Use the .circleci/config.yml in my repo**.
5. Click **Set Up Project**.

### Step 3: View Pipeline Runs
- CircleCI will automatically discover `.circleci/config.yml` on the `main` branch.
- Each git push will trigger the `ci-pipeline` workflow.
- Inspect test duration, pass/fail charts, and JUnit reports under the **Tests** tab.
