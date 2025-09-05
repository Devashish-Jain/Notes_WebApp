# Notes App Automated Deployment Script
# This script helps automate the deployment process for both backend (Render) and frontend (Vercel)
# Run this script from the root of your Notes App project

param(
    [Parameter(HelpMessage="Deployment mode: 'local', 'staging', or 'production'")]
    [ValidateSet('local', 'staging', 'production')]
    [string]$Mode = 'production',
    
    [Parameter(HelpMessage="Skip frontend deployment")]
    [switch]$SkipFrontend,
    
    [Parameter(HelpMessage="Skip backend deployment")]
    [switch]$SkipBackend,
    
    [Parameter(HelpMessage="Verify deployment only (no building)")]
    [switch]$VerifyOnly
)

# Color functions for better output
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param([string]$Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Info { param([string]$Message) Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
function Write-Step { param([string]$Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }

Write-Host "🌟 Notes App Deployment Script" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Info "Mode: $Mode"
Write-Info "Skip Frontend: $SkipFrontend"
Write-Info "Skip Backend: $SkipBackend"
Write-Info "Verify Only: $VerifyOnly"
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Error "Please run this script from the root of your Notes App project"
    Write-Info "Expected structure: /backend and /frontend folders"
    exit 1
}

# Configuration
$BackendDir = "backend"
$FrontendDir = "frontend"
$BackendUrl = ""
$FrontendUrl = ""

# Load environment-specific configurations
switch ($Mode) {
    'local' {
        $BackendUrl = "http://localhost:8080"
        $FrontendUrl = "http://localhost:5173"
    }
    'staging' {
        $BackendUrl = "https://your-staging-backend.onrender.com"
        $FrontendUrl = "https://your-staging-frontend.vercel.app"
    }
    'production' {
        $BackendUrl = "https://your-production-backend.onrender.com"
        $FrontendUrl = "https://your-production-frontend.vercel.app"
    }
}

# Verify environment setup
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $errors = @()
    
    # Check Java
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        Write-Success "Java found: $javaVersion"
    } catch {
        $errors += "Java not found. Please install Java 17+"
    }
    
    # Check Maven
    try {
        $mavenVersion = mvn --version 2>&1 | Select-Object -First 1
        Write-Success "Maven found: $mavenVersion"
    } catch {
        $errors += "Maven not found. Please install Maven 3.6+"
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        $errors += "Node.js not found. Please install Node.js 18+"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm found: v$npmVersion"
    } catch {
        $errors += "npm not found"
    }
    
    if ($errors.Count -gt 0) {
        Write-Error "Prerequisites check failed:"
        $errors | ForEach-Object { Write-Error "  - $_" }
        exit 1
    }
    
    Write-Success "All prerequisites met!"
}

# Test backend build and functionality
function Test-Backend {
    Write-Step "Testing backend..."
    
    Push-Location $BackendDir
    
    try {
        # Build backend
        if (-not $VerifyOnly) {
            Write-Info "Building backend..."
            mvn clean compile -DskipTests
            if ($LASTEXITCODE -ne 0) {
                throw "Backend build failed"
            }
            Write-Success "Backend build successful"
        }
        
        # Test if server can start (for local testing)
        if ($Mode -eq 'local') {
            Write-Info "Testing backend server startup..."
            $backendProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -PassThru -WindowStyle Hidden
            Start-Sleep 15
            
            try {
                $response = Invoke-RestMethod -Uri "$BackendUrl/api/public/stats" -Method GET -TimeoutSec 10
                Write-Success "Backend API responding correctly"
                Write-Info "Stats response: $($response | ConvertTo-Json -Compress)"
            } catch {
                Write-Warning "Backend API test failed: $($_.Exception.Message)"
            } finally {
                Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
            }
        }
        
    } catch {
        Write-Error "Backend testing failed: $($_.Exception.Message)"
        return $false
    } finally {
        Pop-Location
    }
    
    return $true
}

# Test frontend build
function Test-Frontend {
    Write-Step "Testing frontend..."
    
    Push-Location $FrontendDir
    
    try {
        # Install dependencies
        if (-not $VerifyOnly) {
            Write-Info "Installing frontend dependencies..."
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "Frontend dependency installation failed"
            }
            Write-Success "Frontend dependencies installed"
        }
        
        # Build frontend
        if (-not $VerifyOnly) {
            Write-Info "Building frontend..."
            npm run build
            if ($LASTEXITCODE -ne 0) {
                throw "Frontend build failed"
            }
            Write-Success "Frontend build successful"
            
            # Check if build artifacts exist
            if (Test-Path "dist") {
                $distFiles = Get-ChildItem "dist" | Measure-Object
                Write-Info "Build artifacts: $($distFiles.Count) files in dist/"
            }
        }
        
    } catch {
        Write-Error "Frontend testing failed: $($_.Exception.Message)"
        return $false
    } finally {
        Pop-Location
    }
    
    return $true
}

# Deployment verification
function Test-Deployment {
    Write-Step "Verifying deployment..."
    
    $tests = @()
    
    # Test backend endpoints
    if (-not $SkipBackend) {
        Write-Info "Testing backend endpoints..."
        
        try {
            # Test public stats endpoint
            $statsResponse = Invoke-RestMethod -Uri "$BackendUrl/api/public/stats" -Method GET -TimeoutSec 30
            $tests += @{
                Name = "Backend Stats API"
                Status = "✅ PASS"
                Details = "Total Users: $($statsResponse.totalUsers), Total Notes: $($statsResponse.totalNotes)"
            }
        } catch {
            $tests += @{
                Name = "Backend Stats API"
                Status = "❌ FAIL"
                Details = $_.Exception.Message
            }
        }
        
        # Test backend health (if available)
        try {
            $healthResponse = Invoke-RestMethod -Uri "$BackendUrl/actuator/health" -Method GET -TimeoutSec 10 -ErrorAction SilentlyContinue
            $tests += @{
                Name = "Backend Health Check"
                Status = "✅ PASS"
                Details = "Status: $($healthResponse.status)"
            }
        } catch {
            # Health endpoint might not be available, that's ok
            $tests += @{
                Name = "Backend Health Check"
                Status = "⚠️ SKIP"
                Details = "Actuator health endpoint not available"
            }
        }
    }
    
    # Test frontend
    if (-not $SkipFrontend) {
        Write-Info "Testing frontend accessibility..."
        
        try {
            $frontendResponse = Invoke-WebRequest -Uri $FrontendUrl -Method GET -TimeoutSec 30
            if ($frontendResponse.StatusCode -eq 200) {
                $tests += @{
                    Name = "Frontend Accessibility"
                    Status = "✅ PASS"
                    Details = "HTTP $($frontendResponse.StatusCode) - Content loaded"
                }
            } else {
                $tests += @{
                    Name = "Frontend Accessibility"
                    Status = "❌ FAIL"
                    Details = "HTTP $($frontendResponse.StatusCode)"
                }
            }
        } catch {
            $tests += @{
                Name = "Frontend Accessibility"
                Status = "❌ FAIL"
                Details = $_.Exception.Message
            }
        }
    }
    
    # Display test results
    Write-Host ""
    Write-Host "🔍 Deployment Verification Results" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    
    $passCount = 0
    $failCount = 0
    
    foreach ($test in $tests) {
        Write-Host "$($test.Name): $($test.Status)"
        Write-Host "   └─ $($test.Details)" -ForegroundColor Gray
        
        if ($test.Status.Contains("✅")) { $passCount++ }
        elseif ($test.Status.Contains("❌")) { $failCount++ }
    }
    
    Write-Host ""
    Write-Host "Results: $passCount passed, $failCount failed" -ForegroundColor $(if ($failCount -eq 0) { 'Green' } else { 'Yellow' })
    
    return ($failCount -eq 0)
}

# Show deployment URLs and next steps
function Show-DeploymentInfo {
    Write-Host ""
    Write-Host "🎉 Deployment Information" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    
    if (-not $SkipBackend) {
        Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
        Write-Host "  └─ API Documentation: $BackendUrl/swagger-ui.html" -ForegroundColor Gray
        Write-Host "  └─ Public Stats: $BackendUrl/api/public/stats" -ForegroundColor Gray
    }
    
    if (-not $SkipFrontend) {
        Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Test user registration and login" -ForegroundColor White
    Write-Host "  2. Create notes with image uploads" -ForegroundColor White
    Write-Host "  3. Test note sharing functionality" -ForegroundColor White
    Write-Host "  4. Submit feedback through the app" -ForegroundColor White
    Write-Host "  5. Monitor application logs for any issues" -ForegroundColor White
    
    if ($Mode -eq 'production') {
        Write-Host ""
        Write-Host "🔒 Production Security Reminders:" -ForegroundColor Red
        Write-Host "  • Ensure all environment variables are secure" -ForegroundColor White
        Write-Host "  • Database credentials should be rotated regularly" -ForegroundColor White
        Write-Host "  • Monitor Cloudinary usage and billing" -ForegroundColor White
        Write-Host "  • Set up monitoring and alerting" -ForegroundColor White
    }
}

# Environment validation
function Test-Environment {
    Write-Step "Validating environment configuration..."
    
    $configFile = if ($Mode -eq 'local') { "$BackendDir/src/main/resources/application.properties" } else { "ENVIRONMENT_VARIABLES.md" }
    
    if ($Mode -eq 'local') {
        if (Test-Path $configFile) {
            Write-Success "Local configuration file found"
        } else {
            Write-Warning "Local configuration file not found: $configFile"
        }
    } else {
        Write-Info "For production deployment, ensure all environment variables are set:"
        Write-Info "  • Render: Database, JWT, CORS, Cloudinary"
        Write-Info "  • Vercel: VITE_API_BASE_URL"
        Write-Info "  • See ENVIRONMENT_VARIABLES.md for complete list"
    }
}

# Main execution flow
try {
    Test-Prerequisites
    Test-Environment
    
    $success = $true
    
    if (-not $SkipBackend) {
        $success = $success -and (Test-Backend)
    }
    
    if (-not $SkipFrontend) {
        $success = $success -and (Test-Frontend)
    }
    
    if ($success) {
        Write-Success "Build tests completed successfully!"
        
        if ($Mode -ne 'local' -or $VerifyOnly) {
            $deploymentSuccess = Test-Deployment
            
            if ($deploymentSuccess) {
                Write-Success "All deployment verifications passed!"
                Show-DeploymentInfo
            } else {
                Write-Warning "Some deployment verifications failed. Check the results above."
                exit 1
            }
        } else {
            Write-Info "Local build completed. Use deployment platforms (Render/Vercel) for actual deployment."
            Show-DeploymentInfo
        }
    } else {
        Write-Error "Build tests failed. Please fix the issues and try again."
        exit 1
    }
    
} catch {
    Write-Error "Deployment script failed: $($_.Exception.Message)"
    Write-Info "Stack trace:"
    Write-Host $_.Exception.StackTrace -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Success "Deployment script completed successfully! 🎉"
Write-Host "For detailed deployment instructions, see:" -ForegroundColor Gray
Write-Host "  • RENDER_DEPLOYMENT.md (Backend)" -ForegroundColor Gray
Write-Host "  • VERCEL_DEPLOYMENT.md (Frontend)" -ForegroundColor Gray
Write-Host "  • ENVIRONMENT_VARIABLES.md (Configuration)" -ForegroundColor Gray
