# ---------------------------------------------------------------------------
#  Gestion Hôtel V2 — lancement rapide en mode démo (H2 en mémoire)
#  Usage :  powershell -ExecutionPolicy Bypass -File .\run-dev.ps1
# ---------------------------------------------------------------------------
$root = $PSScriptRoot

Write-Host "==> Démarrage du backend (http://localhost:9090) ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\backend'; " +
  "if (-not (Test-Path target\hotelv2-1.0.0.jar)) { mvn -DskipTests package }; " +
  "java -jar target\hotelv2-1.0.0.jar"
)

Start-Sleep -Seconds 2

Write-Host "==> Démarrage du frontend (http://localhost:4200) ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$root\frontend'; " +
  "if (-not (Test-Path node_modules)) { npm install --legacy-peer-deps }; " +
  "npm start"
)

Write-Host ""
Write-Host "Backend  : http://localhost:9090  (console H2 : /h2-console)" -ForegroundColor Green
Write-Host "Frontend : http://localhost:4200" -ForegroundColor Green
Write-Host "Comptes  : admin/admin, manager/1234, reception/1234, serveur/1234, caisse/1234" -ForegroundColor Yellow
