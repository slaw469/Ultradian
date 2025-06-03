#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING NEXT.JS STARTUP ISSUES');
console.log('=====================================');

// Function to run command and capture output
function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔸 Running: ${command}`);
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        resolve({ error, stdout, stderr });
      } else {
        console.log(`✅ Success: ${command}`);
        resolve({ stdout, stderr });
      }
    });
  });
}

async function debugStartup() {
  console.log('\n📋 STEP 1: Current environment check');
  
  // Check current Next.js version
  const nodeModulesNext = path.join(process.cwd(), 'node_modules', 'next', 'package.json');
  if (fs.existsSync(nodeModulesNext)) {
    const nextPkg = JSON.parse(fs.readFileSync(nodeModulesNext, 'utf8'));
    console.log(`📦 Current Next.js version: ${nextPkg.version}`);
  } else {
    console.log('❌ Next.js not found in node_modules');
  }

  // Check for conflicting files
  console.log('\n📋 STEP 2: Checking for problematic files');
  const problematicFiles = [
    'src/pages/_document.tsx',
    'pages/_document.tsx',
    'app/_document.tsx',
    '.next',
    'node_modules/.pnpm'
  ];
  
  problematicFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`⚠️  Found potentially problematic: ${file}`);
    } else {
      console.log(`✅ Clean: ${file}`);
    }
  });

  console.log('\n📋 STEP 3: Force installing Next.js 14.1.0');
  
  // Kill any running processes on port 3000
  await runCommand('lsof -ti :3000 | xargs kill -9 || true');
  
  // Clean everything
  await runCommand('rm -rf .next node_modules/.cache');
  
  // Force install exact Next.js 14.1.0
  console.log('🔧 Installing exact Next.js 14.1.0...');
  const installResult = await runCommand('npm install next@14.1.0 --save-exact --force');
  
  if (installResult.error) {
    console.log('❌ Failed to install Next.js 14.1.0');
    process.exit(1);
  }

  console.log('\n📋 STEP 4: Verifying installation');
  
  // Verify Next.js version
  if (fs.existsSync(nodeModulesNext)) {
    const nextPkg = JSON.parse(fs.readFileSync(nodeModulesNext, 'utf8'));
    console.log(`✅ Verified Next.js version: ${nextPkg.version}`);
    
    if (!nextPkg.version.startsWith('14.1.0')) {
      console.log(`❌ Wrong version installed! Expected 14.1.0, got ${nextPkg.version}`);
      process.exit(1);
    }
  }

  console.log('\n📋 STEP 5: Starting development server with debug mode');
  
  // Set debug environment variables
  const env = {
    ...process.env,
    DEBUG: 'next:*',
    NODE_ENV: 'development',
    NEXT_DEBUG: '1'
  };

  const nextDev = spawn('node_modules/.bin/next', ['dev', '--port', '3000'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env
  });

  nextDev.on('error', (error) => {
    console.error('❌ Failed to start Next.js:', error);
  });

  nextDev.on('close', (code) => {
    console.log(`🔄 Next.js exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    nextDev.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
    process.exit(0);
  });

  console.log('🚀 Next.js 14.1.0 development server starting...');
  console.log('📍 Visit: http://localhost:3000');
  console.log('🛑 Press Ctrl+C to stop');
}

// Run the debug startup
debugStartup().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
}); 