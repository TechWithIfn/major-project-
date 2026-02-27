param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$backupPath = Join-Path $workspaceRoot ".vscode\disabled-extensions.backup.json"

$codeCmd = Get-Command code -ErrorAction SilentlyContinue
if (-not $codeCmd) {
    Write-Host "[ERROR] VS Code CLI 'code' is not available in PATH." -ForegroundColor Red
    Write-Host "Open VS Code Command Palette and run: Shell Command: Install 'code' command in PATH" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $backupPath)) {
    Write-Host "[ERROR] Backup file not found: $backupPath" -ForegroundColor Red
    Write-Host "Run allowlist enforcement once to create backup." -ForegroundColor Yellow
    exit 1
}

$backup = Get-Content $backupPath -Raw | ConvertFrom-Json
$toEnable = @($backup.disabledExtensions | ForEach-Object { $_.ToString().ToLowerInvariant() })

if ($toEnable.Count -eq 0) {
    Write-Host "No extensions found in backup to re-enable." -ForegroundColor Green
    exit 0
}

Write-Host "Extensions to re-enable from backup:" -ForegroundColor Cyan
$toEnable | ForEach-Object { Write-Host "  - $_" }

if ($DryRun) {
    Write-Host "`n[DRY RUN] No changes made." -ForegroundColor Cyan
    exit 0
}

foreach ($id in $toEnable) {
    Write-Host "Re-enabling $id ..." -ForegroundColor DarkYellow
    code --enable-extension $id | Out-Null
}

Write-Host "`nDone. Restart VS Code to apply all extension host changes." -ForegroundColor Green
