# DevOps & CI/CD Viva Examination Questions and Answers

This document prepares students and candidates for academic and technical viva sessions covering DevOps theory, Continuous Integration, CircleCI, Git, automated testing, and failure handling.

---

## Section 1: DevOps & Continuous Integration Fundamentals

### Q1: What is DevOps, and how does Continuous Integration fit into it?
**Answer:**  
DevOps is a set of practices, cultural philosophies, and tools that automates and integrates the processes between software development (Dev) and IT operations (Ops) teams.  
**Continuous Integration (CI)** is the foundational engineering practice of DevOps where developers regularly merge their code modifications into a central repository (often multiple times per day). Each integration triggers an automated build and automated test suite to detect regressions and integration bugs as early as possible ("shift-left").

### Q2: What is the difference between Continuous Integration (CI), Continuous Delivery (CD), and Continuous Deployment?
**Answer:**  
- **Continuous Integration (CI):** Automates code integration, compilation/building, linting, and automated unit/integration testing on every commit or pull request.
- **Continuous Delivery (CD):** Ensures that code passing CI is automatically built, packaged, and continuously ready to be deployed to production at any moment, but actual release to production requires manual human approval.
- **Continuous Deployment:** Takes Continuous Delivery a step further by automatically releasing every passing build directly into production without manual human intervention.

### Q3: What is "Shift-Left Testing"?
**Answer:**  
Shift-Left Testing is the practice of moving testing earlier in the software development lifecycle. Instead of waiting until after deployment or staging to test an application, automated tests (unit tests, contract tests, linters, and security checks) run in CI on every developer commit and PR. This dramatically reduces the cost and time required to fix defects.

---

## Section 2: CircleCI Pipeline Architecture

### Q4: Explain the primary components of CircleCI's `config.yml`.
**Answer:**  
CircleCI configuration files are written in YAML (version 2.1) and comprise:
1. **Executors**: The execution environment in which jobs run (e.g., Docker container `cimg/python:3.11`, virtual machine `machine`, or macOS).
2. **Commands**: Reusable snippets of shell instructions.
3. **Jobs**: Independent units of work (e.g., `backend-test-and-lint`, `frontend-build-and-test`) that execute a sequence of steps.
4. **Workflows**: Directed Acyclic Graphs (DAGs) that define the orchestration, order, parallelism, and dependency relationships among jobs (e.g. `requires: [backend-test-and-lint]`).

### Q5: How does dependency caching work in CircleCI, and why is it essential?
**Answer:**  
CircleCI provides `save_cache` and `restore_cache` steps. Caches are keyed using cryptographic checksums of dependency manifests:
```yaml
- restore_cache:
    keys:
      - v1-backend-deps-{{ checksum "backend/requirements-dev.txt" }}
      - v1-backend-deps-
```
When dependencies have not changed, CircleCI skips downloading and compiling wheels over the network, shaving minutes off pipeline runs and reducing external API rate-limiting risks.

### Q6: What is the difference between `store_test_results` and `store_artifacts` in CircleCI?
**Answer:**  
- **`store_test_results`**: Specifically parses JUnit-compatible XML files (`junit.xml`). CircleCI indexes individual test statuses, timings, and failure stack traces, enabling the "Test Insights" UI tab.
- **`store_artifacts`**: Stores raw output files (e.g., coverage HTML folders, compiled React `dist/` tarballs, Docker logs) which can be viewed or downloaded from the "Artifacts" tab in CircleCI.

---

## Section 3: Automated Testing & FastAPI

### Q7: Why should test execution be independent and order-agnostic? How was this achieved in this project?
**Answer:**  
If Test B depends on data created by Test A, running tests out of order, in parallel, or in isolation causes flaky failures.  
In this project, order independence is achieved in `backend/tests/conftest.py` using a pytest fixture:
```python
@pytest.fixture(autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
```
Before every single test function, fresh database tables are created; after the test finishes, all tables and rows are dropped completely. Each test starts with a clean slate.

### Q8: What is FastAPI TestClient, and how does it differ from making live network requests?
**Answer:**  
`TestClient` (built on Starlette and HTTPX) utilizes the ASGI standard to send mock HTTP requests directly into the FastAPI application in-process without spinning up an actual network socket or listening on a TCP port. This results in ultra-fast execution (0.16 seconds for 24 tests) while testing full routing, validation, serialization, and status code behavior.

### Q9: Why is HTTP 422 Unprocessable Content returned by FastAPI instead of HTTP 400 Bad Request?
**Answer:**  
FastAPI uses Pydantic for request body validation. If the request syntax is valid JSON but fails schema rules (e.g., missing required `title`, title exceeds max length, or invalid status enum value), the HTTP standard specifies `422 Unprocessable Content` because the server understands the content type and syntax, but cannot process the contained instructions.

---

## Section 4: Git, GitHub & Branching Strategies

### Q10: Describe the Git feature branch workflow used in CI/CD.
**Answer:**  
1. Developers pull the latest code from `main`.
2. A feature branch is created: `git checkout -b feature/task-status-filter`.
3. Code and unit tests are written and committed.
4. The branch is pushed to GitHub, and a Pull Request (PR) is opened.
5. The CI pipeline triggers automatically via webhooks on the PR.
6. Once the pipeline passes and code review is complete, the branch is merged into `main`.

### Q11: How do GitHub Branch Protection rules enforce CI quality gates?
**Answer:**  
GitHub Branch Protection allows administrators to require that specific status checks (such as the CircleCI `ci-pipeline/backend-test-and-lint` job) pass before pull requests can be merged into the default branch. This prevents broken code from ever reaching production.

---

## Section 5: Pipeline Failure & Security

### Q12: What happens when a test fails in the CI pipeline? Explain the fail-fast principle.
**Answer:**  
When an assertion fails, Pytest returns an exit code of `1`. The Unix shell in the CircleCI container detects this non-zero exit code and immediately halts execution of that job.  
Downstream dependent jobs (such as `pipeline-summary`) are skipped because their requirement was not met. The commit is marked with a red cross (FAILED) on GitHub, and notifications are sent to the author.

### Q13: How does the application prevent leaking CircleCI API tokens to the frontend client?
**Answer:**  
The React application never communicates directly with the CircleCI Cloud API. Instead, it queries a secure server-side proxy endpoint on the FastAPI backend (`/api/pipeline/status`). The backend reads `CIRCLECI_TOKEN` securely from server environment variables and strips sensitive headers before forwarding sanitized workflow data to the frontend.
