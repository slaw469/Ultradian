#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING NEXT.JS 14 STARTUP - V2');
console.log('====================================');

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

async function debugStartupV2() {
  console.log('\n📋 STEP 1: Environment diagnostics');
  
  // Check system info
  console.log(`🖥️  Platform: ${process.platform}`);
  console.log(`🏗️  Architecture: ${process.arch}`);
  console.log(`📦 Node version: ${process.version}`);
  
  // Check current Next.js version
  const nodeModulesNext = path.join(process.cwd(), 'node_modules', 'next', 'package.json');
  if (fs.existsSync(nodeModulesNext)) {
    const nextPkg = JSON.parse(fs.readFileSync(nodeModulesNext, 'utf8'));
    console.log(`📦 Current Next.js version: ${nextPkg.version}`);
  } else {
    console.log('❌ Next.js not found in node_modules');
  }

  console.log('\n📋 STEP 2: SWC Binary Check');
  
  // Check for SWC binaries
  const swcPaths = [
    'node_modules/@next/swc-darwin-arm64',
    'node_modules/@next/swc-darwin-x64',
    'node_modules/@next/swc-linux-arm64-gnu',
    'node_modules/@next/swc-linux-x64-gnu',
    'node_modules/@next/swc-win32-x64-msvc'
  ];
  
  swcPaths.forEach(swcPath => {
    const fullPath = path.join(process.cwd(), swcPath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Found SWC binary: ${swcPath}`);
    } else {
      console.log(`❌ Missing SWC binary: ${swcPath}`);
    }
  });

  console.log('\n📋 STEP 3: Clean environment setup');
  
  // Kill any running processes
  await runCommand('lsof -ti :3000 | xargs kill -9 || true');
  
  // Clean build artifacts
  await runCommand('rm -rf .next .swc node_modules/.cache');
  
  console.log('\n📋 STEP 4: Configure for Babel fallback (if SWC fails)');
  
  // Create next.config.js with SWC disabled as fallback
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  experimental: {
    // Disable SWC and fallback to Babel if there are issues
    forceSwcTransforms: false,
  },
  swcMinify: false, // Disable SWC minification
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on \`fs\` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;`;

  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('✅ Updated next.config.js with SWC fallback configuration');

  console.log('\n📋 STEP 5: Install Babel as fallback');
  
  const babelResult = await runCommand('npm install @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript --save-dev');
  
  // Create babel config
  const babelConfig = {
    "presets": ["next/babel"]
  };
  
  fs.writeFileSync(path.join(process.cwd(), '.babelrc'), JSON.stringify(babelConfig, null, 2));
  console.log('✅ Created .babelrc configuration');

  console.log('\n📋 STEP 6: Starting Next.js 14 with comprehensive debugging');
  
  // Set environment variables for maximum debugging
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    NEXT_DEBUG: '1',
    DEBUG: 'next:*',
    FORCE_COLOR: '1',
    // Disable SWC completely if it's causing issues
    NEXT_DISABLE_SWC: '1'
  };

  console.log('🚀 Starting Next.js 14.1.0 development server...');
  console.log('📍 Will be available at: http://localhost:3000');
  console.log('🛑 Press Ctrl+C to stop');
  console.log('🔧 Using Babel compilation (SWC disabled)');
  
  const nextDev = spawn('node_modules/.bin/next', ['dev', '--port', '3000'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env
  });

  nextDev.on('error', (error) => {
    console.error('❌ Failed to start Next.js:', error);
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Try: npm install --force');
    console.log('2. Check if port 3000 is free: lsof -i :3000');
    console.log('3. Try different port: next dev --port 3001');
  });

  nextDev.on('close', (code) => {
    console.log(`\n🔄 Next.js exited with code ${code}`);
    if (code !== 0) {
      console.log('❌ Server crashed. Check the error messages above.');
    }
  });

  // Handle process termination gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    nextDev.kill('SIGINT');
    setTimeout(() => process.exit(0), 1000);
  });

  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
    setTimeout(() => process.exit(0), 1000);
  });
}

// Run the debug startup
debugStartupV2().catch(error => {
  console.error('💥 Fatal error:', error);
  console.log('\n🔧 Emergency troubleshooting:');
  console.log('1. Delete node_modules and reinstall: rm -rf node_modules && npm install');
  console.log('2. Use different Node.js version with nvm');
  console.log('3. Try npx create-next-app@14 to test baseline');
  process.exit(1);
}); 