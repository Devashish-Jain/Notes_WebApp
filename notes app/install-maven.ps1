# Maven Installation Script for Windows
# Run this script as Administrator in PowerShell

Write-Host "Installing Maven on Windows..." -ForegroundColor Green

# Method 1: Try Chocolatey first
Write-Host "Checking for Chocolatey..." -ForegroundColor Yellow
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Chocolatey found! Installing Maven..." -ForegroundColor Green
    choco install maven -y
} else {
    Write-Host "Chocolatey not found. Installing Chocolatey first..." -ForegroundColor Yellow
    
    # Install Chocolatey
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "Installing Maven with Chocolatey..." -ForegroundColor Green
    choco install maven -y
}

# Refresh PATH again
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installation
Write-Host "Verifying Maven installation..." -ForegroundColor Yellow
try {
    mvn --version
    Write-Host "✅ Maven installed successfully!" -ForegroundColor Green
    Write-Host "You can now run: mvn spring-boot:run" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Maven installation failed. Please try manual installation." -ForegroundColor Red
    Write-Host "Manual installation guide:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://maven.apache.org/download.cgi" -ForegroundColor White
    Write-Host "2. Extract to: C:\Program Files\Apache\maven\" -ForegroundColor White
    Write-Host "3. Add to PATH: C:\Program Files\Apache\maven\apache-maven-x.x.x\bin" -ForegroundColor White
}
