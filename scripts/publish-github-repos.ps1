# Publish portfolio projects as standalone GitHub repos.
# Prerequisite: gh auth login   OR   create empty public repos on GitHub first.

$ErrorActionPreference = "Continue"

$ghDir = "C:\Program Files\GitHub CLI"
if ((Test-Path "$ghDir\gh.exe") -and ($env:Path -notlike "*GitHub CLI*")) {
  $env:Path += ";$ghDir"
}

$root = Split-Path $PSScriptRoot -Parent

$projects = @(
  @{ Name = "Chrome-Dino";        Path = "$root\projects\chrome-dino" },
  @{ Name = "Cafe-X";             Path = "$root\projects\cafe-x" },
  @{ Name = "Armeh-Gold-Gallery"; Path = "$root\projects\armeh-gold-gallery" }
)

function Publish-One {
  param([string]$RepoName, [string]$SourcePath)

  if (-not (Test-Path $SourcePath)) {
    Write-Warning "Missing source: $SourcePath"
    return
  }

  $dest = Join-Path $env:TEMP "publish-$RepoName"
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  Copy-Item -Path $SourcePath -Destination $dest -Recurse -Force

  Push-Location $dest
  try {
    git init -b main
    git add -A
    git commit -m "Initial commit."
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "Commit failed for $RepoName"
      return
    }

    $remote = "https://github.com/AshkanPazaj/$RepoName.git"
    Write-Host "`n--- $RepoName ---" -ForegroundColor Cyan

    if (Get-Command gh -ErrorAction SilentlyContinue) {
      gh auth status 2>$null | Out-Null
      if ($LASTEXITCODE -eq 0) {
        gh repo create "AshkanPazaj/$RepoName" --public --source=. --remote=origin --push 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
          Write-Host "Created and pushed via gh." -ForegroundColor Green
          return
        }
      }
    }

    $remotes = git remote 2>$null
    if ($remotes -match 'origin') {
      git remote set-url origin $remote
    } else {
      git remote add origin $remote
    }

    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Pushed to $remote" -ForegroundColor Green
    } else {
      Write-Host "Push failed. Create an empty public repo at:" -ForegroundColor Yellow
      Write-Host "  https://github.com/new?name=$RepoName" -ForegroundColor Yellow
      Write-Host "Then run this script again." -ForegroundColor Yellow
    }
  } finally {
    Pop-Location
  }
}

foreach ($p in $projects) {
  Publish-One -RepoName $p.Name -SourcePath $p.Path
}

Write-Host "`nDone." -ForegroundColor Cyan
