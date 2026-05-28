# idontgivaf.uk

## Dev

```bash
# Terminal 1 — Backend (Port 5000)
cd backend
dotnet run

# Terminal 2 — Frontend (Port 5173, proxied to 5000)
cd frontend
npm install
npm run dev
```

## Prod Build

```bash
cd frontend && npm run build   # → ../backend/wwwroot/
cd backend  && dotnet run      # serves everything on port 5000
```
