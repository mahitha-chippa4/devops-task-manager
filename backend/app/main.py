from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import health, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Task Management REST API with automated CircleCI CI/CD pipeline and Pytest test suite.",
    lifespan=lifespan,
)

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router)
app.include_router(tasks.router)


@app.get("/", tags=["root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": "/health",
    }
