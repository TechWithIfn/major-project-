param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$extensionsConfigPath = Join-Path $workspaceRoot ".vscode\extensions.json"
$backupDir = Join-Path $workspaceRoot ".vscode"
$backupPath = Join-Path $backupDir "disabled-extensions.backup.json"

if (-not (Test-Path $extensionsConfigPath)) {
    Write-Host "[ERROR] extensions.json not found at $extensionsConfigPath" -ForegroundColor Red
    exit 1
}

$codeCmd = Get-Command code -ErrorAction SilentlyContinue
if (-not $codeCmd) {
    Write-Host "[ERROR] VS Code CLI 'code' is not available in PATH." -ForegroundColor Red
    Write-Host "Open VS Code Command Palette and run: Shell Command: Install 'code' command in PATH" -ForegroundColor Yellow
    exit 1
}

$config = Get-Content $extensionsConfigPath -Raw | ConvertFrom-Json
$allowlist = @($config.recommendations | ForEach-Object { $_.ToString().ToLowerInvariant() })

if ($allowlist.Count -eq 0) {
    Write-Host "[ERROR] No recommended extensions found in .vscode/extensions.json" -ForegroundColor Red
    exit 1
}

$installed = @(code --list-extensions | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ })

if ($installed.Count -eq 0) {
    Write-Host "No user extensions are currently installed." -ForegroundColor Green
    exit 0
}

$toDisable = @($installed | Where-Object { $allowlist -notcontains $_ })

if ($toDisable.Count -eq 0) {
    Write-Host "All installed extensions are already in the allowlist." -ForegroundColor Green
    exit 0
}

Write-Host "Allowlist:" -ForegroundColor Cyan
$allowlist | ForEach-Object { Write-Host "  - $_" }

Write-Host "`nExtensions to disable:" -ForegroundColor Yellow
$toDisable | ForEach-Object { Write-Host "  - $_" }

if ($DryRun) {
    Write-Host "`n[DRY RUN] No changes made." -ForegroundColor Cyan
    exit 0
}

foreach ($id in $toDisable) {
    Write-Host "Disabling $id ..." -ForegroundColor DarkYellow
    code --disable-extension $id | Out-Null
}

$backupData = [ordered]@{
    timestamp = (Get-Date).ToString("o")
    disabledExtensions = $toDisable
}
$backupData | ConvertTo-Json -Depth 5 | Set-Content $backupPath

Write-Host "`nDone. Restart VS Code to apply all extension host changes." -ForegroundColor Green
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan
