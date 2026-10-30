param([string]$Message)

$ErrorActionPreference = 'Stop'

$remote = 'git@github.com:Suxxxxp/supengxiang.git'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
Set-Location $projectRoot

# 首次连接自动信任 github.com 的 host key，避免交互提示
$env:GIT_SSH_COMMAND = 'ssh -o StrictHostKeyChecking=accept-new'

if (-not (Test-Path (Join-Path $projectRoot '.git'))) {
    git init | Out-Host
}

$current = $null
try { $current = git remote get-url origin 2>$null } catch { $current = $null }
if (-not $current) {
    git remote add origin $remote | Out-Host
} elseif ($current -ne $remote) {
    git remote set-url origin $remote | Out-Host
}

git add -A

if (git status --porcelain) {
    if (-not $Message) { $Message = "Update project $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
    git commit -m $Message | Out-Host
} else {
    Write-Host 'Nothing to commit, working tree clean.'
}

$branch = git branch --show-current
if (-not $branch) {
    git branch -M main | Out-Host
    $branch = 'main'
}

git push -u origin $branch | Out-Host
