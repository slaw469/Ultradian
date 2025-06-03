document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const endBtn = document.getElementById('endBtn');
  const syncBtn = document.getElementById('syncBtn');
  const statusCard = document.getElementById('trackingStatus');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const sessionDuration = document.getElementById('sessionDuration');
  const currentDomain = document.getElementById('currentDomain');
  const topDomains = document.getElementById('topDomains');
  const sessionStats = document.getElementById('sessionStats');
  const tabSwitches = document.getElementById('tabSwitches');
  const totalTabs = document.getElementById('totalTabs');

  let updateInterval;

  // Initialize UI
  updateStatus();

  // Event listeners
  startBtn.addEventListener('click', startTracking);
  endBtn.addEventListener('click', endTracking);
  syncBtn.addEventListener('click', syncWithApp);

  async function startTracking() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'startSession' });
      if (response.success) {
        updateStatus();
        startPeriodicUpdates();
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  }

  async function endTracking() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'endSession' });
      if (response.success) {
        updateStatus();
        stopPeriodicUpdates();
        
        // Show session summary
        if (response.data) {
          showSessionSummary(response.data);
        }
      }
    } catch (error) {
      console.error('Error ending tracking:', error);
    }
  }

  async function syncWithApp() {
    try {
      // Check if app session exists in local storage or get from app
      const appData = await checkAppSession();
      
      const response = await chrome.runtime.sendMessage({ 
        action: 'syncWithApp',
        sessionData: appData
      });
      
      if (response.success) {
        // Visual feedback
        syncBtn.textContent = 'Synced!';
        setTimeout(() => {
          syncBtn.textContent = 'Sync with App';
        }, 2000);
      }
    } catch (error) {
      console.error('Error syncing with app:', error);
      syncBtn.textContent = 'Sync Failed';
      setTimeout(() => {
        syncBtn.textContent = 'Sync with App';
      }, 2000);
    }
  }

  async function updateStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      
      if (response.isTracking) {
        // Active state
        statusCard.className = 'status-card status-active';
        statusIndicator.className = 'status-indicator indicator-active';
        statusText.textContent = 'Tracking active';
        sessionDuration.textContent = formatDuration(response.sessionDuration);
        
        // Show/hide buttons
        startBtn.classList.add('hidden');
        endBtn.classList.remove('hidden');
        
        // Show current domain
        if (response.currentDomain) {
          currentDomain.innerHTML = `Currently on: <strong>${response.currentDomain}</strong>`;
          currentDomain.classList.remove('hidden');
        }
        
        // Show top domains
        if (response.topDomains && response.topDomains.length > 0) {
          displayTopDomains(response.topDomains);
          topDomains.classList.remove('hidden');
        }
        
        // Show stats (if available)
        sessionStats.classList.remove('hidden');
        
      } else {
        // Inactive state
        statusCard.className = 'status-card status-inactive';
        statusIndicator.className = 'status-indicator indicator-inactive';
        statusText.textContent = 'Not tracking';
        sessionDuration.textContent = '0m';
        
        // Show/hide buttons
        startBtn.classList.remove('hidden');
        endBtn.classList.add('hidden');
        
        // Hide dynamic content
        currentDomain.classList.add('hidden');
        topDomains.classList.add('hidden');
        sessionStats.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  function displayTopDomains(domains) {
    topDomains.innerHTML = domains.map(domain => `
      <div class="domain-item">
        <span class="domain-name">${domain.domain}</span>
        <span class="domain-time">${domain.timeMinutes}m (${domain.percentage}%)</span>
      </div>
    `).join('');
  }

  function formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function startPeriodicUpdates() {
    updateInterval = setInterval(updateStatus, 5000); // Update every 5 seconds
  }

  function stopPeriodicUpdates() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }

  function showSessionSummary(sessionData) {
    // Create a simple modal-like summary
    const summaryHtml = `
      <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
        <h4 style="margin: 0 0 8px 0; color: #0c4a6e;">Session Complete!</h4>
        <p style="margin: 0; font-size: 12px; color: #075985;">
          Duration: ${formatDuration(sessionData.duration)}<br>
          Tab switches: ${sessionData.tabSwitches}<br>
          Domains visited: ${Object.keys(sessionData.domainTimes).length}
        </p>
      </div>
    `;
    
    // Add to the status card temporarily
    statusCard.insertAdjacentHTML('beforeend', summaryHtml);
    
    // Remove after 10 seconds
    setTimeout(() => {
      const summary = statusCard.querySelector('[style*="background: #f0f9ff"]');
      if (summary) summary.remove();
    }, 10000);
  }

  async function checkAppSession() {
    try {
      // Try to get session data from the app
      const response = await fetch('http://localhost:3000/api/browser-extension/session', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Could not connect to app:', error);
    }
    
    return null;
  }

  // Start periodic updates if already tracking
  chrome.runtime.sendMessage({ action: 'getStatus' }).then(response => {
    if (response.isTracking) {
      startPeriodicUpdates();
    }
  });
}); 