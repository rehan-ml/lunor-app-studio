# Lunor App Studio — Round 1 Prototype

An AI-assisted app-development workspace that converts a rough mobile-app idea
into something the learner can understand, plan, build, explain, and learn.

## What it demonstrates

1. **Understand** — clarifies the user, problem, outcome, assumptions, and open
   questions instead of blindly generating code.
2. **Plan** — proposes an MVP, architecture, stack, milestones, and later scope.
3. **Build** — generates a small starter project with an inspectable file tree
   and a live phone preview.
4. **Explain** — records the reasons and trade-offs behind technical choices.
5. **Learn** — gives the learner a short path for rebuilding the generated app
   themselves.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8010
```

Open `http://127.0.0.1:8010`.

On Windows, you can instead double-click `run_demo.bat`; it starts the verified
demo on `http://127.0.0.1:8510`.

The interface also works by opening `static/index.html` directly. In that mode,
the browser uses the same local prototype engine when the FastAPI endpoint is
not available.

## Suggested demo prompt

> Build a habit tracker for students that works offline, shows streaks, and
> keeps the daily flow simple.

Select **Cross-platform**, **Beginner**, and **Offline-first**, then choose
**Create app blueprint**.

## Current prototype boundary

The prototype generates a structured plan and starter code through an
explainable local engine. It does not claim to compile and publish a complete
production application. In a production version, `planner.py` would be replaced
or extended by an LLM with schema-constrained JSON output, while keeping the
same front-end contract.

See [AI_USE.md](AI_USE.md) for the required AI-tool disclosure.

## Verify the planning engine

```bash
python -m unittest discover -s tests -v
```

Submission-ready wording and a short demo order are in
[SUBMISSION_NOTES.md](SUBMISSION_NOTES.md).
