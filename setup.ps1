# PowerShell setup script for Campus Lost & Found Intelligence System
# Run this from the project root: d:\Prithvi\Academics\College\Sem5\DBMS\Mini_Project
# Usage:  .\setup.ps1  -MySQLExe "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -Password "YourPasswordHere"

param(
    [string]$MySQLExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    [string]$User,
    [string]$Password
)

$ErrorActionPreference = "Stop"

# Load MySQL credentials from the application's .env.local unless explicitly supplied.
$envFile = "campus-lnf\.env.local"
if (Test-Path $envFile) {
    $envValues = @{}
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $envValues[$key] = $value
        }
    }

    if (-not $PSBoundParameters.ContainsKey('User') -and $envValues['MYSQL_USER']) {
        $User = $envValues['MYSQL_USER']
    }
    if (-not $PSBoundParameters.ContainsKey('Password') -and $envValues['MYSQL_PASSWORD']) {
        $Password = $envValues['MYSQL_PASSWORD']
    }
}

if (-not $User) { $User = "root" }
if (-not $Password) { throw "MySQL password was not provided. Set MYSQL_PASSWORD in campus-lnf\.env.local or pass -Password." }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Campus L&F - Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- MySQL ---
Write-Host "[1/3] Running MySQL schema (tables, constraints, indexes)..." -ForegroundColor Yellow
Get-Content "database\mysql\01_schema.sql" | & $MySQLExe -u $User "--password=$Password"
if ($LASTEXITCODE -ne 0) { throw "MySQL schema setup failed with exit code $LASTEXITCODE." }
Write-Host "  Done." -ForegroundColor Green

Write-Host "[2/3] Running MySQL views, procedures, triggers..." -ForegroundColor Yellow
Get-Content "database\mysql\02_views_procedures_triggers.sql" | & $MySQLExe -u $User "--password=$Password"
if ($LASTEXITCODE -ne 0) { throw "MySQL views, procedures, and triggers setup failed with exit code $LASTEXITCODE." }
Write-Host "  Done." -ForegroundColor Green

Write-Host "[3/3] Inserting seed data..." -ForegroundColor Yellow
Get-Content "database\mysql\03_seed_data.sql" | & $MySQLExe -u $User "--password=$Password"
if ($LASTEXITCODE -ne 0) { throw "MySQL seed data setup failed with exit code $LASTEXITCODE." }
Write-Host "  Done." -ForegroundColor Green

# --- MongoDB ---
Write-Host ""
Write-Host "[4/4] Seeding MongoDB (item_details collection)..." -ForegroundColor Yellow
Push-Location campus-lnf
$env:NODE_PATH = (Resolve-Path "node_modules").Path
node ..\database\mongodb\seed.js
$mongoExitCode = $LASTEXITCODE
Pop-Location
if ($mongoExitCode -ne 0) { throw "MongoDB seed failed with exit code $mongoExitCode." }
Write-Host "  Done." -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Setup complete!" -ForegroundColor Green
Write-Host " Update campus-lnf\.env.local with your MySQL password." -ForegroundColor Yellow
Write-Host " Then run:  cd campus-lnf && npm run dev" -ForegroundColor Yellow
Write-Host " Open:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
