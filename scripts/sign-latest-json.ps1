$ErrorActionPreference = "Stop"

$keyPath = Join-Path $PSScriptRoot ".." "signing-key.txt"
$inputFile = Join-Path $PSScriptRoot ".." "src-tauri\target\x86_64-pc-windows-msvc\release\bundle\latest.json.in"
$outputFile = Join-Path $PSScriptRoot ".." "src-tauri\target\x86_64-pc-windows-msvc\release\bundle\latest.json"

# Read the private key
$privateKey = Get-Content $keyPath -Raw
$privateKey = $privateKey.Trim()

# Read the manifest with placeholder
$manifest = Get-Content $inputFile -Raw | ConvertFrom-Json

# Build the file to sign (manifest without placeholder signature)
$manifestPresign = $manifest | ConvertTo-Json -Compress -Depth 10
$signingContent = $manifestPresign -replace '"signature":"PLACEHOLDER"','"signature":""'

# Use Tauri signer via npm
$env:TAURI_SIGNING_PRIVATE_KEY = $privateKey

# Write signing content to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$signingContent | Set-Content $tempFile -NoNewline

# Run tauri signer sign with the temp file
$sigOutput = & npx tauri signer sign --private-key $privateKey $tempFile 2>&1
Write-Host "Signer output: $sigOutput"

# Check for .sig file
$sigFile = "$tempFile.sig"
if (Test-Path $sigFile) {
    $signature = Get-Content $sigFile -Raw
    Write-Host "Signature: $signature"
    
    # Build final manifest
    $manifest.platforms.'windows-x86_64'.signature = $signature.Trim()
    $finalJson = $manifest | ConvertTo-Json -Compress -Depth 10
    $finalJson | Set-Content $outputFile -NoNewline
    Write-Host "Wrote $outputFile"
    
    Remove-Item $sigFile -Force
} else {
    Write-Host "ERROR: .sig file not found at $sigFile"
}
Remove-Item $tempFile -Force
