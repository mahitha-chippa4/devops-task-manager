import os
from typing import Any, Optional

import httpx
from fastapi import APIRouter, status
from pydantic import BaseModel

from app.config import settings

router = APIRouter(tags=["system"])


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str


class PipelineStatusResponse(BaseModel):
    configured: bool
    message: str
    project_slug: Optional[str] = None
    last_pipeline: Optional[dict[str, Any]] = None
    workflows: Optional[list[dict[str, Any]]] = None


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
)
def get_health():
    """Verify backend health and running environment."""
    return HealthResponse(
        status="healthy",
        app=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )


@router.get(
    "/api/pipeline/status",
    response_model=PipelineStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch live CircleCI pipeline status via secure backend proxy",
)
async def get_pipeline_status():
    """Proxy endpoint to securely query CircleCI API without leaking tokens to the frontend."""
    circle_token = os.getenv("CIRCLECI_TOKEN")
    project_slug = os.getenv("CIRCLECI_PROJECT_SLUG")  # e.g. "gh/username/devops-ci-pipeline"

    if not circle_token or not project_slug:
        return PipelineStatusResponse(
            configured=False,
            message=(
                "CircleCI integration not configured in backend environment. "
                "Set CIRCLECI_TOKEN and CIRCLECI_PROJECT_SLUG in your backend environment "
                "to query live CircleCI API status."
            ),
            project_slug=project_slug,
            last_pipeline=None,
            workflows=None,
        )

    headers = {
        "Circle-Token": circle_token,
        "Accept": "application/json",
    }
    url = f"https://circleci.com/api/v2/project/{project_slug}/pipeline"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                return PipelineStatusResponse(
                    configured=True,
                    message=f"CircleCI API responded with status {resp.status_code}: {resp.text[:200]}",
                    project_slug=project_slug,
                )

            data = resp.json()
            items = data.get("items", [])
            last_pipe = items[0] if items else None
            workflows = []

            if last_pipe:
                pipe_id = last_pipe.get("id")
                wf_resp = await client.get(
                    f"https://circleci.com/api/v2/pipeline/{pipe_id}/workflow",
                    headers=headers,
                )
                if wf_resp.status_code == 200:
                    workflows = wf_resp.json().get("items", [])

            return PipelineStatusResponse(
                configured=True,
                message="Successfully retrieved pipeline data from CircleCI API",
                project_slug=project_slug,
                last_pipeline=last_pipe,
                workflows=workflows,
            )
    except Exception as exc:
        return PipelineStatusResponse(
            configured=True,
            message=f"Error connecting to CircleCI API: {str(exc)}",
            project_slug=project_slug,
        )
