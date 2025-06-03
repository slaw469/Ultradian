#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js development server...');

const nextDev = spawn('npx', ['next', 'dev', '--port', '3000'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

nextDev.on('error', (error) => {
  console.error('Failed to start development server:', error);
});

nextDev.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping development server...');
  nextDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  process.exit(0);
}); 