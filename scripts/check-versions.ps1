<#
.SYNOPSIS
    Verifies version consistency across package.json, Cargo.toml, and tauri.conf.json.

.DESCRIPTION
    This script reads the version field from the three primary configuration files
    and ensures they match. It exits with code 1 if any version is mismatched or
    missing, making it suitable for CI gates.

.PARAMETER ExpectedVersion
    Optional specific version to enforce across all files.

.EXAMPLE
    .\scripts\check-versions.ps1

.EXAMPLE
    .\scripts\check-versions.ps1 -ExpectedVersion "1.2.3"
#>
param(
    [string]$ExpectedVersion = ""
)

$ErrorActionPreference = "Stop"

$files = @{
    "package.json" = $null
    "src-tauri/Cargo.toml" = $null
    "src-tauri/tauri.conf.json" = $null
}

$versions = @{}

# ── Read versions ──────────────────────────────────────
foreach ($file in $files.Keys) {
    if (-not (Test-Path $file)) {
        Write-Error "File not found: $file"
        exit 1
    }

    switch -Wildcard ($file) {
        "*package.json" {
            $json = Get-Content $file -Raw | ConvertFrom-Json
            $version = $json.version
        }
        "*Cargo.toml" {
            $content = Get-Content $file -Raw
            if ($content -match '^version\s*=\s*"(.+?)"') {
                $version = $Matches[1]
            } else {
                Write-Error "Could not find version in $file"
                exit 1
            }
        }
        "*tauri.conf.json" {
            $json = Get-Content $file -Raw | ConvertFrom-Json
            $version = $json.version
        }
    }

    $versions[$file] = $version
    Write-Host "$file => $version"
}

# ── Determine expected version ─────────────────────────
if ($ExpectedVersion) {
    $target = $ExpectedVersion
    Write-Host ""
    Write-Host "Enforcing expected version: $target"
} else {
    $target = $versions.Values | Select-Object -First 1
    Write-Host ""
    Write-Host "Using baseline version: $target"
}

# ── Validate consistency ───────────────────────────────
$exitCode = 0
foreach ($file in $versions.Keys) {
    if ($versions[$file] -ne $target) {
        Write-Error "VERSION MISMATCH: $file has '$($versions[$file])' but expected '$target'"
        $exitCode = 1
    }
}

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "All versions are consistent ($target)." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Version mismatch detected. Please align all version fields before releasing." -ForegroundColor Red
    Write-Host ""
    Write-Host "To bump versions:"
    Write-Host "  1. Edit package.json -> version"
    Write-Host "  2. Edit src-tauri/Cargo.toml -> [package].version"
    Write-Host "  3. Edit src-tauri/tauri.conf.json -> version"
    Write-Host "  4. Update docs/CHANGELOG.md"
    Write-Host "  5. Commit and tag: git tag v<version>"
}

exit $exitCode
