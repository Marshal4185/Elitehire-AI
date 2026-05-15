# EliteHire AI Backend

## Run locally

1. Create a virtual environment:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Create a `.env` file in `backend/` with your secrets:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

4. Start the backend:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```


## Deploy to Render / Railway / Heroku

### Render

1. Create a new Web Service in Render.
2. Connect your GitHub repo.
3. Set the build command:

```bash
pip install -r requirements.txt
```

4. Set the start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. Add the environment variables in Render (`GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`).

### Railway

1. Create a new project and connect your GitHub repo.
2. Use `python` as the service type.
3. Set the deploy command:

```bash
pip install -r requirements.txt
```

4. Set the start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. Add `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS` as Railway environment variables.

### Heroku

1. Create a new Heroku app.
2. Add the `Procfile` from this folder.
3. Push the `backend/` folder to the app repo or use GitHub integration.
4. Set config vars on Heroku: `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`.


## Important

- Do not commit `backend/.env` to GitHub.
- Keep your API key and email password secret.
- Use the root `.gitignore` to avoid committing local artifacts.
