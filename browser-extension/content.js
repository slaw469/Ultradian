// Content script for Ultradian Focus Tracker
// This script runs on all pages and can communicate with the background script

// Simple content script that adds page activity detection
let lastActivity = Date.now();

// Track user activity on the page
function trackActivity() {
  lastActivity = Date.now();
}

// Add activity listeners
document.addEventListener('mousedown', trackActivity);
document.addEventListener('keydown', trackActivity);
document.addEventListener('scroll', trackActivity);

// Optional: Send activity data to background script
function sendActivityUpdate() {
  chrome.runtime.sendMessage({
    action: 'pageActivity',
    timestamp: lastActivity,
    url: window.location.href,
    title: document.title
  }).catch(() => {
    // Ignore errors if background script isn't ready
  });
}

// Send activity updates every 30 seconds
setInterval(sendActivityUpdate, 30000);

// Send initial activity
sendActivityUpdate(); 