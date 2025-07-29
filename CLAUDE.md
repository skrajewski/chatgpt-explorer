## Technology Stack

- **Frontend**: Svelte, Tailwind CSS,
- **Libraries**: JSZip (file processing)
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Static files (no backend required)

## Code style

- Use Svelte frontend framework
- Split the code into functional components
- Code should be extendable. There SHOULD NOT be single app.js file that contains everything
- Abstract the file import and processing

## Workflow

- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
- If you have no explicitly said task, check tasks.md file.
  - If there is task, that could be done, pick the first one, spawn another agent and let it work with them.
  - When agent finishes the task, they should be marked as checked.
  - Then swap another agent, to verify the outcome of the task. Use playwright MCP and load sample data to test the UI.
  - If everything is correct, add changed files to stage and commit the work.
  - Don't forget to commit work before starting new task

**Note for AI Assistant**: When working on this project, always refer to the PRD.md file for comprehensive feature requirements and technical specifications. This CLAUDE.md file provides the essential context for understanding the current implementation and architecture decisions.

## Development Notes

- no need to stage and commit tasks.md
- NEVER EVER RUN DEVELOPMENT SERVER. MOST LIKELY SERVER IS ALREADY STARTED SO USE localhost:5173
