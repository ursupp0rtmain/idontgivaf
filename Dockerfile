# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
COPY backend/  ./backend/
RUN cd frontend && npm run build
# Vite outputs to ../backend/wwwroot → /app/backend/wwwroot

# ── Stage 2: Build .NET backend ───────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS backend
WORKDIR /app
COPY backend/ ./
COPY --from=frontend /app/backend/wwwroot ./wwwroot
RUN dotnet publish -c Release -o /publish

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=backend /publish .
# Railway injects $PORT; ASP.NET Core reads ASPNETCORE_URLS
CMD ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet IdontgivafApi.dll
