# Script to help update SOCKET_URL in App.js with your IP address

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  WebSocket Demo - IP Configuration  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP address
Write-Host "Finding your computer's IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" -and $_.PrefixOrigin -eq "Dhcp"}).IPAddress | Select-Object -First 1

if ($ipAddress) {
    Write-Host "✅ Found IP Address: $ipAddress" -ForegroundColor Green
    Write-Host ""
    
    # Show current SOCKET_URL in App.js
    $appJsPath = "mobile\App.js"
    if (Test-Path $appJsPath) {
        $currentLine = Get-Content $appJsPath | Select-String "const SOCKET_URL" | Select-Object -First 1
        Write-Host "Current setting in App.js:" -ForegroundColor Yellow
        Write-Host "  $currentLine" -ForegroundColor White
        Write-Host ""
        
        # Ask if user wants to update
        Write-Host "Do you want to update App.js with this IP? (Y/N)" -ForegroundColor Yellow
        $response = Read-Host
        
        if ($response -eq "Y" -or $response -eq "y") {
            # Backup original file
            Copy-Item $appJsPath "$appJsPath.backup" -Force
            
            # Read file content
            $content = Get-Content $appJsPath -Raw
            
            # Replace SOCKET_URL line
            $newLine = "const SOCKET_URL = 'http://$ipAddress:3000'; // Auto-configured IP"
            $content = $content -replace "const SOCKET_URL = .*", $newLine
            
            # Write back to file
            Set-Content $appJsPath -Value $content -NoNewline
            
            Write-Host ""
            Write-Host "✅ Updated successfully!" -ForegroundColor Green
            Write-Host "New setting: const SOCKET_URL = 'http://$ipAddress:3000';" -ForegroundColor Green
            Write-Host ""
            Write-Host "Backup saved as: App.js.backup" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "Skipped. You can manually update App.js:" -ForegroundColor Yellow
            Write-Host "  const SOCKET_URL = 'http://$ipAddress:3000';" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ App.js not found at: $appJsPath" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Could not find IP address automatically" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run 'ipconfig' manually and look for IPv4 Address" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start backend: docker-compose up -d" -ForegroundColor White
Write-Host "2. Install deps: cd mobile && npm install" -ForegroundColor White
Write-Host "3. Start Expo: npx expo start" -ForegroundColor White
Write-Host "4. Scan QR code with Expo Go app" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
