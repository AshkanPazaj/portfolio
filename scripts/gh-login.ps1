# Run GitHub CLI login (fixes "gh not recognized" after winget install)
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
  Write-Host "GitHub CLI not found. Install: winget install GitHub.cli" -ForegroundColor Red
  exit 1
}
& $gh auth login --git-protocol https --web
