# WebSocket Demo - Start Script for Windows PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  WebSocket Demo - Starting Services  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green

# Start Docker services
Write-Host ""
Write-Host "Starting Backend and Database..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait a moment for services to initialize
Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service status
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Yellow
docker-compose ps

# Test backend health
Write-Host ""
Write-Host "Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend might still be starting up..." -ForegroundColor Yellow
}

# Get local IP address
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Your Computer's IP Address:" -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"}).IPAddress
foreach ($ip in $ipAddress) {
    Write-Host "  📱 $ip" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update SOCKET_URL in mobile/App.js:" -ForegroundColor White
Write-Host "   - For Android Emulator: http://10.0.2.2:3000" -ForegroundColor Cyan
Write-Host "   - For Physical Device: http://<YOUR_IP>:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Install mobile dependencies:" -ForegroundColor White
Write-Host "   cd mobile" -ForegroundColor Cyan
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start React Native:" -ForegroundColor White
Write-Host "   npx react-native start" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Run on device (in new terminal):" -ForegroundColor White
Write-Host "   npx react-native run-android" -ForegroundColor Cyan
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:    docker-compose logs -f backend" -ForegroundColor Cyan
Write-Host "  Stop all:     docker-compose down" -ForegroundColor Cyan
Write-Host "  Restart:      docker-compose restart" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Ready for demo! Good luck! 🚀" -ForegroundColor Green
