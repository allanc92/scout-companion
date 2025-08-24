# Manual deployment script for Scout
Write-Host "🚀 Preparing Scout for deployment..." -ForegroundColor Green

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$deployPath = ".\deploy-package"
if (Test-Path $deployPath) { Remove-Item $deployPath -Recurse -Force }
New-Item -ItemType Directory -Path $deployPath

# Copy essential files
Copy-Item "package.json" $deployPath
Copy-Item "package-lock.json" $deployPath
Copy-Item "src" $deployPath -Recurse

Write-Host "✅ Deployment package created in $deployPath" -ForegroundColor Green
Write-Host "📋 Upload the contents of deploy-package to your Azure App Service" -ForegroundColor Cyan
Write-Host "🔗 Or use Azure Portal > App Service > Deployment Center > Deploy" -ForegroundColor Cyan
