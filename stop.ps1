# WebSocket Demo - Stop Script for Windows PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  WebSocket Demo - Stopping Services  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping all services..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To remove all data (including database):" -ForegroundColor Yellow
    Write-Host "  docker-compose down -v" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to stop services" -ForegroundColor Red
}
