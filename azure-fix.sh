# Azure Deployment Fix Script

echo "🔧 Azure Deployment Fix - Installing Dependencies"
echo "================================================"

# Make sure we're in the right directory
cd /home/site/wwwroot

# Check current state
echo "📂 Current directory:"
pwd

echo "📋 Files in directory:"
ls -la

echo "📦 Package.json exists:"
cat package.json

echo "🔄 Running npm install..."
npm install

echo "✅ Dependencies installed:"
ls -la node_modules

echo "🚀 Starting Scout..."
node index.js
