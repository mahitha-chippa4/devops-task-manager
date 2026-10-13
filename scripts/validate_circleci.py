#!/usr/bin/env python3
"""
CircleCI Configuration Validator Script
Validates the structural integrity and schema requirements of .circleci/config.yml.
"""
import sys
from pathlib import Path
import yaml

CONFIG_PATH = Path(".circleci/config.yml")


def validate_config():
    if not CONFIG_PATH.is_file():
        print(f"❌ Error: CircleCI configuration file not found at {CONFIG_PATH}")
        return False

    print(f"🔍 Validating {CONFIG_PATH}...")
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as exc:
        print(f"❌ YAML Parsing Error: {exc}")
        return False

    # 1. Version check
    version = data.get("version")
    if version != 2.1:
        print(f"❌ Invalid version: expected 2.1, got {version}")
        return False
    print("  ✓ Schema version: 2.1")

    # 2. Jobs check
    jobs = data.get("jobs", {})
    if not isinstance(jobs, dict) or len(jobs) == 0:
        print("❌ No jobs defined in configuration")
        return False
    print(f"  ✓ Jobs defined: {list(jobs.keys())}")

    required_jobs = ["backend-test-and-lint", "frontend-build-and-test"]
    for rj in required_jobs:
        if rj not in jobs:
            print(f"❌ Required job '{rj}' missing from config.jobs")
            return False

    # Check each job has executor and steps
    for job_name, job_def in jobs.items():
        if not isinstance(job_def, dict):
            print(f"❌ Job '{job_name}' must be an object")
            return False
        if "docker" not in job_def and "machine" not in job_def and "executor" not in job_def:
            print(f"❌ Job '{job_name}' has no executor (docker/machine/executor)")
            return False
        if "steps" not in job_def or not isinstance(job_def["steps"], list):
            print(f"❌ Job '{job_name}' must have a list of steps")
            return False

        # Verify test result storage in testing jobs
        step_names = [
            list(s.keys())[0] if isinstance(s, dict) else s for s in job_def["steps"]
        ]
        if "test" in job_name and "store_test_results" not in step_names:
            print(f"⚠️ Warning: Job '{job_name}' tests code but does not store test results")

    # 3. Workflows check
    workflows = data.get("workflows")
    if not workflows or not isinstance(workflows, dict):
        print("❌ No workflows defined in configuration")
        return False

    for wf_name, wf_def in workflows.items():
        if wf_name == "version":
            continue
        print(f"  ✓ Workflow: {wf_name}")
        wf_jobs = wf_def.get("jobs", [])
        if not wf_jobs:
            print(f"❌ Workflow '{wf_name}' has no jobs configured")
            return False

        # Validate job references and dependencies
        registered_job_names = set(jobs.keys())
        for item in wf_jobs:
            if isinstance(item, str):
                job_ref = item
                requires = []
            elif isinstance(item, dict):
                job_ref = list(item.keys())[0]
                requires = item[job_ref].get("requires", [])
            else:
                continue

            if job_ref not in registered_job_names:
                print(f"❌ Workflow references undefined job '{job_ref}'")
                return False

            for req in requires:
                if req not in registered_job_names:
                    print(f"❌ Job '{job_ref}' requires undefined job '{req}'")
                    return False

    print("✅ CircleCI configuration is structurally sound and completely valid!")
    return True


if __name__ == "__main__":
    if not validate_config():
        sys.exit(1)
    sys.exit(0)
