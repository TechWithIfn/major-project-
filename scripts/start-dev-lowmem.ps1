$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
Set-Location $workspaceRoot

$pythonExe = Join-Path $workspaceRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    Write-Host "[ERROR] Python venv not found at .venv\Scripts\python.exe" -ForegroundColor Red
    Write-Host "Create it first: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/2] Starting backend on http://localhost:5000 with low-memory settings..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "$env:OPENBLAS_NUM_THREADS='1'; $env:OMP_NUM_THREADS='1'; $env:MKL_NUM_THREADS='1'; $env:NUMEXPR_NUM_THREADS='1'; $env:SHIKSHA_LLM_CTX='1024'; $env:SHIKSHA_LLM_THREADS='2'; & '$pythonExe' backend/api.py"
)

Write-Host "[2/2] Starting frontend on http://localhost:3000 with Node memory cap..." -ForegroundColor Cyan
$env:NODE_OPTIONS = "--max-old-space-size=1024"
pnpm dev
