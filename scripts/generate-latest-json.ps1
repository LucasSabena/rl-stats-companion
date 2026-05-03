<#
.SYNOPSIS
    Generates or verifies the Tauri updater manifest (latest.json) from release assets.

.DESCRIPTION
    This script scans the Tauri bundle output directory for the updater manifest
    (latest.json) and validates that it contains the required platforms and signatures.
    If the manifest is missing, it attempts to reconstruct it from the available
    release artifacts.

    Tauri v2 automatically generates latest.json during `pnpm tauri build` when the
    updater plugin is configured. This script is a fallback/verification tool.

.PARAMETER BundleDir
    Path to the Tauri bundle output directory. Default: src-tauri/target/release/bundle

.PARAMETER Version
    Version string to embed in the manifest (e.g., "1.2.3").

.PARAMETER ReleaseUrl
    Base URL for release assets. Default is inferred from repository origin.

.PARAMETER OutFile
    Output path for the generated manifest. Default: latest.json in current directory.

.EXAMPLE
    .\scripts\generate-latest-json.ps1 -Version "0.2.0"

.EXAMPLE
    .\scripts\generate-latest-json.ps1 -BundleDir "custom/path" -OutFile "manifest.json"
#>
param(
    [string]$BundleDir = "src-tauri/target/release/bundle",
    [string]$Version = "",
    [string]$ReleaseUrl = "",
    [string]$OutFile = "latest.json"
)

$ErrorActionPreference = "Stop"

function Get-RepoReleaseUrl {
    try {
        $remote = git remote get-url origin 2>$null
        if ($remote -match "github\.com[:/](.+?)(?:\.git)?$") {
            $repo = $Matches[1]
            return "https://github.com/$repo/releases/latest/download"
        }
    } catch {
        Write-Warning "Could not determine GitHub repository URL from git remote."
    }
    return $null
}

function Read-TauriConfig {
    $configPath = "src-tauri/tauri.conf.json"
    if (-not (Test-Path $configPath)) {
        throw "tauri.conf.json not found at $configPath"
    }
    return Get-Content $configPath -Raw | ConvertFrom-Json
}

# ── Resolve version ────────────────────────────────────
if (-not $Version) {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $Version = $packageJson.version
    Write-Host "Using version from package.json: $Version"
}

# ── Resolve release URL ────────────────────────────────
if (-not $ReleaseUrl) {
    $ReleaseUrl = Get-RepoReleaseUrl
    if (-not $ReleaseUrl) {
        throw "Could not determine release URL. Please specify -ReleaseUrl."
    }
    Write-Host "Using release URL: $ReleaseUrl"
}

# ── Look for existing latest.json ──────────────────────
$existingManifest = Get-ChildItem -Path $BundleDir -Recurse -Filter "latest.json" | Select-Object -First 1

if ($existingManifest) {
    Write-Host "Found existing updater manifest: $($existingManifest.FullName)"
    $manifest = Get-Content $existingManifest.FullName -Raw | ConvertFrom-Json

    # Validate structure
    $requiredFields = @("version", "platforms")
    foreach ($field in $requiredFields) {
        if (-not $manifest.PSObject.Properties.Name.Contains($field)) {
            throw "Existing manifest is missing required field: $field"
        }
    }

    # Check signatures exist
    $platforms = $manifest.platforms.PSObject.Properties.Name
    foreach ($platform in $platforms) {
        $platformData = $manifest.platforms.$platform
        if (-not $platformData.signature) {
            Write-Warning "Platform '$platform' is missing a signature. The updater will reject unsigned updates."
        }
        if (-not $platformData.url) {
            throw "Platform '$platform' is missing a download URL."
        }
    }

    Write-Host "Existing manifest validated successfully."
    Write-Host "Platforms: $($platforms -join ', ')"

    # Optionally rewrite with correct URL if needed
    if ($manifest.version -ne $Version) {
        Write-Warning "Manifest version ($($manifest.version)) does not match expected version ($Version). Updating..."
        $manifest.version = $Version
    }

    $manifest | ConvertTo-Json -Depth 10 | Set-Content $OutFile -Encoding UTF8
    Write-Host "Manifest written to: $OutFile"
    exit 0
}

# ── Reconstruct manifest from scratch ──────────────────
Write-Host "No existing manifest found. Attempting to reconstruct from bundle artifacts..."

$tauriConfig = Read-TauriConfig
$pubkey = $tauriConfig.plugins.updater.pubkey

$platformMap = @{
    "windows-x86_64" = @("*.msi", "*x64-setup.exe", "*_x64_en-US.msi")
    "windows-aarch64" = @("*aarch64*.msi", "*aarch64-setup.exe")
}

$manifest = [ordered]@{
    version = $Version
    notes = "See release notes at $ReleaseUrl"
    pub_date = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    platforms = [ordered]@{}
}

foreach ($platform in $platformMap.Keys) {
    $patterns = $platformMap[$platform]
    $found = $false

    foreach ($pattern in $patterns) {
        $artifact = Get-ChildItem -Path $BundleDir -Recurse -Include $pattern | Select-Object -First 1
        if ($artifact) {
            $url = "$ReleaseUrl/$($artifact.Name)"
            $sigFile = $artifact.FullName + ".sig"
            $signature = $null

            if (Test-Path $sigFile) {
                $signature = Get-Content $sigFile -Raw -Encoding UTF8
                Write-Host "Found signature for $($artifact.Name)"
            } else {
                Write-Warning "Signature file not found for $($artifact.Name). The updater will reject this update."
                Write-Warning "Ensure TAURI_SIGNING_PRIVATE_KEY is set during build to generate signatures."
            }

            $manifest.platforms[$platform] = [ordered]@{
                signature = $signature
                url = $url
            }
            $found = $true
            break
        }
    }

    if (-not $found) {
        Write-Warning "No artifact found for platform: $platform"
    }
}

if ($manifest.platforms.Count -eq 0) {
    throw "No platform artifacts found in $BundleDir. Cannot generate manifest."
}

$manifest | ConvertTo-Json -Depth 10 | Set-Content $OutFile -Encoding UTF8
Write-Host "Generated manifest written to: $OutFile"
Write-Host ""
Write-Host "IMPORTANT: Ensure the updater manifest is signed."
Write-Host "  - Set TAURI_SIGNING_PRIVATE_KEY as a GitHub Secret"
Write-Host "  - Set TAURI_SIGNING_PRIVATE_KEY_PASSWORD if the key is encrypted"
Write-Host "  - The public key in tauri.conf.json must match the private key used for signing"
Write-Host ""
Write-Host "Manifest contents:"
Get-Content $OutFile -Raw
