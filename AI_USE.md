# AI tools and technologies used

## AI assistance

- **OpenAI Codex:** used as a development assistant for early product structure,
  implementation support, accessibility checks, and debugging.
- The final product scope, selected workflow, project review, and submission are
  owned by the candidate. Every generated section is intentionally kept small
  and explainable so it can be reviewed before submission.

## Product technologies

- Python and FastAPI for the optional local planning API.
- HTML, CSS, and JavaScript for the interactive prototype.
- A deterministic prompt-understanding fallback so the demo works without
  exposing an API key.
- The output contract is designed so a hosted LLM can replace the fallback in a
  production version.

## Why this approach

The assessment asks for a working prototype. A dependable no-key demo is more
useful during review than a screen that fails when an API quota or key is
missing. The architecture still leaves a clear integration point for an LLM.

