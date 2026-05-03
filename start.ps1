# Start.ps1 — build and deploy IncidentHub API and UI
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "Starting build and deploy for IncidentHub..."

Push-Location "IncidentHub.UI"
Write-Host "Building UI..."
npm run build
Pop-Location

Write-Host "Building Docker images and deploying containers..."
docker-compose build incidenthub-api incidenthub-ui --no-cache
docker-compose up -d incidenthub-api incidenthub-ui

Write-Host "Deploy complete. UI: http://localhost:5173  API: http://localhost:3000 (Swagger: /api/docs)"
