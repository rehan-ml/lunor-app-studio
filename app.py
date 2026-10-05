"""FastAPI entry point for the Lunor App Studio prototype."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from planner import build_blueprint


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="Lunor App Studio",
    description="Prompt-to-learning prototype for planning mobile applications.",
    version="1.0.0",
)


class BlueprintRequest(BaseModel):
    prompt: str = Field(min_length=12, max_length=1200)
    platform: str = Field(default="cross-platform")
    experience: str = Field(default="beginner")
    constraints: list[str] = Field(default_factory=list)


@app.post("/api/blueprint")
async def create_blueprint(request: BlueprintRequest) -> dict:
    """Turn a short product idea into an understandable build blueprint."""

    return build_blueprint(
        prompt=request.prompt,
        platform=request.platform,
        experience=request.experience,
        constraints=request.constraints,
    )


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "mode": "prototype"}


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def home() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")

