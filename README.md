# Elitehire-AI
AI recruitment platform with resume analysis and interview engine

## Vercel Deployment
This repository is configured to deploy the frontend app on Vercel from `frontend/`.

### What is already set up
- `vercel.json` builds from `frontend/package.json`
- The Vite build output is configured to use `dist`
- SPA routing is enabled with fallback to `/index.html`

### What you need to do on Vercel
1. Connect this GitHub repository to Vercel.
2. When Vercel asks for the root directory, choose `frontend`.
3. Set the Vercel environment variable:
   - `VITE_API_BASE_URL` = your backend URL
4. Deploy the project.

### Important note
- The FastAPI backend is not deployable on Vercel in its current form.
- For a full production setup, deploy the backend separately on a Python-friendly host (Render, Railway, Fly.io, Heroku, etc.) and point `VITE_API_BASE_URL` to that backend.
