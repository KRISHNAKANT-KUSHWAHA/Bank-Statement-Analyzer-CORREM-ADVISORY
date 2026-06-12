# Render + Vercel Deployment

## 1. Push the project to GitHub

Do not commit `server/.env`, the SQLite database, uploaded PDFs, or generated
Excel files. The root `.gitignore` excludes them.

## 2. Deploy the backend on Render

The repository includes `render.yaml`, which creates:

- A FastAPI web service
- A Render PostgreSQL database
- A generated production `SECRET_KEY`

In Render:

1. Choose **New > Blueprint**.
2. Connect this repository.
3. Select the repository's `render.yaml`.
4. Set `CORS_ORIGINS` to the final Vercel URL, for example:

   ```text
   https://correm-advisory.vercel.app
   ```

5. Deploy the Blueprint.
6. Copy the backend URL, for example:

   ```text
   https://correm-advisory-api.onrender.com
   ```

The health endpoint is `/` and API documentation is available at `/docs`.

## 3. Deploy the frontend on Vercel

In Vercel:

1. Import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Keep the detected Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add this environment variable for Production and Preview:

   ```text
   VITE_API_URL=https://correm-advisory-api.onrender.com
   ```

5. Deploy.

If Vercel assigns a different URL than expected, update `CORS_ORIGINS` in the
Render service and redeploy it. Multiple allowed origins are comma-separated.

## 4. File persistence

PostgreSQL preserves users and history records. Render's free web-service
filesystem does not preserve uploaded PDFs or generated Excel files after a
restart or redeploy.

For persistent Excel downloads, use one of these:

1. Attach a paid Render persistent disk at `/var/data` and set:

   ```text
   DATA_DIR=/var/data
   ```

2. Store reports in object storage such as Amazon S3 or Cloudinary.

The current free configuration uses:

```text
DATA_DIR=/tmp/correm-advisory
```

Therefore, history metadata survives in PostgreSQL, but an older Excel download
can return "Excel file not found" after the backend restarts.

## Environment variables

### Render

```text
DATABASE_URL=<provided automatically by Render PostgreSQL>
SECRET_KEY=<generated automatically by Render>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://your-project.vercel.app
DATA_DIR=/tmp/correm-advisory
```

### Vercel

```text
VITE_API_URL=https://your-api.onrender.com
```
