# Submission Notes

## Project name

**Lunor App Studio — Prompt to Product Learning Workspace**

## Short description

Lunor App Studio is a working concept for extending Lunor from web-development
learning into app development. A user describes an app idea and chooses a
platform, experience level, and constraints. The tool then guides them through
five connected stages: Understand, Plan, Build, Explain, and Learn.

Unlike a simple prompt-to-code generator, the prototype first defines the user
problem and smallest useful outcome. It then creates an MVP plan, recommends a
platform-specific stack, generates readable starter files, explains the
technical decisions and trade-offs, and gives the user a project-based learning
path. A phone preview updates to make the proposed product direction tangible.

## AI tools used

- **OpenAI Codex** — development assistant for product-structure suggestions,
  implementation support, debugging and accessibility review.
- **Lunor App Studio's local prompt-planning engine** — converts the prompt into
  a stable structured blueprint for the prototype demonstration. It is designed
  so an LLM returning schema-constrained JSON can replace or extend it later.

## Technologies used

- Python
- FastAPI
- HTML
- CSS
- JavaScript
- Uvicorn

## What to show in a 2-minute demo

1. Enter the habit-tracker example prompt.
2. Select **Cross-platform**, **Beginner**, and **Offline-first**.
3. Generate the blueprint and briefly show the live phone preview.
4. Move through Understand → Plan → Build → Explain → Learn.
5. In Build, switch between generated files and use **Copy code**.
6. Show **Export blueprint** to demonstrate that the output is reusable.

## Honest prototype boundary

The generated starter code is an inspectable starting point, not a claim that a
complete production app has been compiled and deployed. The current local engine
keeps the assessment demo reliable without an API key. A production version
would connect the same JSON contract to an LLM and add build sandboxing, tests,
and device deployment.
