# Publish portfolio projects as standalone GitHub repos.
# Prerequisite: gh auth login   OR   create empty public repos on GitHub first.
#
# Repos created:
#   https://github.com/AshkanPazaj/Chrome-Dino
#   https://github.com/AshkanPazaj/Cafe-X
#   https://github.com/AshkanPazaj/Armeh-Gold-Gallery

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$projects = @(
  @{ Name = "Chrome-Dino";       Path = "$root\projects\chrome-dino" },
  @{ Name = "Cafe-X";            Path = "$root\projects\cafe-x" },
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

  git -C $dest init -b main | Out-Null
  git -C $dest add -A
  git -C $dest commit -m "Initial commit." --allow-empty 2>$null
  if ($LASTEXITCODE -ne 0) {
    git -C $dest commit -m "Initial commit."
  }

  $remote = "https://github.com/AshkanPazaj/$RepoName.git"
  git -C $dest remote remove origin 2>$null
  git -C $dest remote add origin $remote

  Write-Host "`n--- $RepoName ---" -ForegroundColor Cyan

  $gh = Get-Command gh -ErrorAction SilentlyContinue
  if ($gh) {
    $authed = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
      gh repo create "AshkanPazaj/$RepoName" --public --source=$dest --remote=origin --push 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Host "Created and pushed via gh." -ForegroundColor Green
        return
      }
    }
  }

  git -C $dest push -u origin main
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushed to $remote" -ForegroundColor Green
  } else {
    Write-Host "Push failed. Create an empty public repo at:" -ForegroundColor Yellow
    Write-Host "  https://github.com/new?name=$RepoName" -ForegroundColor Yellow
    Write-Host "Then run: git -C `"$dest`" push -u origin main" -ForegroundColor Yellow
  }
}

foreach ($p in $projects) {
  Publish-One -RepoName $p.Name -SourcePath $p.Path
}

Write-Host "`nDone." -ForegroundColor Cyan
