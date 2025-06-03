// Background service worker for tracking web navigation
class WebNavigationTracker {
  constructor() {
    this.currentTab = null;
    this.sessionStartTime = null;
    this.domainTimes = new Map();
    this.tabSwitches = 0;
    this.totalTabs = new Set();
    this.lastActivityTime = Date.now();
    this.isTracking = false;
    
    this.setupEventListeners();
    this.setupActivityTimer();
  }

  setupEventListeners() {
    // Tab activation (switching tabs)
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabChange(activeInfo.tabId);
    });

    // Tab updates (URL changes within same tab)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url && tab.active) {
        this.handleUrlChange(tab);
      }
    });

    // Window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        this.handleWindowBlur();
      } else {
        this.handleWindowFocus(windowId);
      }
    });

    // Messages from popup/content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  async handleTabChange(tabId) {
    this.tabSwitches++;
    this.lastActivityTime = Date.now();
    
    if (this.currentTab) {
      this.recordDomainTime(this.currentTab);
    }

    try {
      const tab = await chrome.tabs.get(tabId);
      this.currentTab = {
        id: tabId,
        url: tab.url,
        domain: this.extractDomain(tab.url),
        startTime: Date.now(),
        title: tab.title
      };
      this.totalTabs.add(tabId);
    } catch (error) {
      console.error('Error getting tab info:', error);
    }
  }

  handleUrlChange(tab) {
    this.lastActivityTime = Date.now();
    
    if (this.currentTab) {
      this.recordDomainTime(this.currentTab);
    }

    this.currentTab = {
      id: tab.id,
      url: tab.url,
      domain: this.extractDomain(tab.url),
      startTime: Date.now(),
      title: tab.title
    };
  }

  handleWindowBlur() {
    if (this.currentTab) {
      this.recordDomainTime(this.currentTab);
      this.currentTab.pausedAt = Date.now();
    }
  }

  async handleWindowFocus(windowId) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      if (tab) {
        this.handleTabChange(tab.id);
      }
    } catch (error) {
      console.error('Error handling window focus:', error);
    }
  }

  recordDomainTime(tab) {
    if (!tab || !tab.domain || !tab.startTime) return;

    const timeSpent = Date.now() - tab.startTime;
    const existingTime = this.domainTimes.get(tab.domain) || 0;
    this.domainTimes.set(tab.domain, existingTime + timeSpent);
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  startSession() {
    this.isTracking = true;
    this.sessionStartTime = Date.now();
    this.domainTimes.clear();
    this.tabSwitches = 0;
    this.totalTabs.clear();
    
    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        this.handleTabChange(tabs[0].id);
      }
    });
  }

  async endSession() {
    if (!this.isTracking) return null;

    if (this.currentTab) {
      this.recordDomainTime(this.currentTab);
    }

    const sessionData = {
      duration: Math.round((Date.now() - this.sessionStartTime) / 1000 / 60), // minutes
      domainTimes: Object.fromEntries(this.domainTimes),
      tabSwitches: this.tabSwitches,
      totalTabs: this.totalTabs.size,
      topDomains: this.getTopDomains(3),
      sessionStart: this.sessionStartTime,
      sessionEnd: Date.now()
    };

    this.isTracking = false;
    return sessionData;
  }

  getTopDomains(limit = 5) {
    return Array.from(this.domainTimes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([domain, time]) => ({
        domain,
        timeMinutes: Math.round(time / 1000 / 60),
        percentage: Math.round((time / (Date.now() - this.sessionStartTime)) * 100)
      }));
  }

  setupActivityTimer() {
    // Check for inactivity every 30 seconds
    setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivityTime;
      if (inactiveTime > 5 * 60 * 1000) { // 5 minutes of inactivity
        this.handleInactivity();
      }
    }, 30000);
  }

  handleInactivity() {
    // Pause current tracking but don't end session
    if (this.currentTab && !this.currentTab.pausedAt) {
      this.recordDomainTime(this.currentTab);
      this.currentTab.pausedAt = Date.now();
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'startSession':
        this.startSession();
        sendResponse({ success: true });
        break;
        
      case 'endSession':
        const sessionData = await this.endSession();
        sendResponse({ success: true, data: sessionData });
        break;
        
      case 'getStatus':
        sendResponse({
          isTracking: this.isTracking,
          currentDomain: this.currentTab?.domain,
          sessionDuration: this.sessionStartTime ? 
            Math.round((Date.now() - this.sessionStartTime) / 1000 / 60) : 0,
          topDomains: this.isTracking ? this.getTopDomains(3) : []
        });
        break;
        
      case 'syncWithApp':
        if (message.sessionData && this.isTracking) {
          await this.syncSessionData(message.sessionData);
        }
        sendResponse({ success: true });
        break;
        
      case 'pageActivity':
        // Handle page activity from content script
        if (this.isTracking && this.currentTab) {
          this.lastActivityTime = message.timestamp || Date.now();
        }
        // Don't send response for page activity to avoid blocking
        break;
    }
  }

  async syncSessionData(appSessionData) {
    // Send current tracking data to the main app
    try {
      const response = await fetch('http://localhost:3000/api/browser-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: appSessionData.sessionId,
          domainTimes: Object.fromEntries(this.domainTimes),
          tabSwitches: this.tabSwitches,
          totalTabs: this.totalTabs.size,
          currentDomain: this.currentTab?.domain
        })
      });
      
      if (!response.ok) {
        console.error('Failed to sync with app');
      }
    } catch (error) {
      console.error('Error syncing with app:', error);
    }
  }
}

// Initialize the tracker
const tracker = new WebNavigationTracker();

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('Ultradian Focus Tracker started');
}); 