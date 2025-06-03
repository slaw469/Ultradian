# Ultradian Focus Tracker - Browser Extension

## 🌐 **Real Web Navigation Tracking**

This browser extension tracks your actual web browsing patterns during focus sessions, providing detailed insights into how you spend time across different websites and domains.

## 📊 **What It Tracks**

- **Domain Time Analysis**: Exact time spent on each website (YouTube: 30min, GitHub: 50min, VS Code: 40min)
- **Tab Switching Patterns**: How often you context-switch between tabs
- **Productivity Scoring**: Categorizes sites as work-focused vs distracting
- **Real-time Activity**: Live monitoring of your current browsing session
- **Window Focus**: Detects when you switch to other applications

## 🚀 **Installation**

### Step 1: Enable Developer Mode
1. Open Chrome/Edge browser
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Toggle **"Developer mode"** in the top right corner

### Step 2: Load Extension
1. Click **"Load unpacked"** button
2. Navigate to the `browser-extension` folder in your Ultradian project
3. Select the folder and click **"Select Folder"**
4. The extension should now appear in your extensions list

### Step 3: Pin Extension
1. Click the puzzle piece icon in your browser toolbar
2. Find "Ultradian Focus Tracker"
3. Click the pin icon to keep it visible

## 🎯 **Usage**

### Starting a Session
1. **In the Main App**: Click "Start Focus Session" and fill out what you're working on
2. **In the Extension**: Click the extension icon → "Start Tracking"
3. **Auto-Sync**: The extension will automatically sync with your active app session

### During a Session
- Extension popup shows:
  - ⏱️ **Live Timer**: Current session duration
  - 🌐 **Current Domain**: What site you're currently on
  - 📊 **Top Domains**: Time breakdown by website
  - 🔄 **Tab Switches**: How often you're context-switching

### Ending a Session
1. **In the Extension**: Click "End Session" 
2. **In the Main App**: Click "End Session" in the Active Session card
3. **Auto-Sync**: Browser data is automatically merged with app session

## 📈 **Data Analysis**

The extension provides rich data that enhances AI analysis:

### Example Session Data
```json
{
  "duration": 47,
  "domainTimes": {
    "github.com": 1680000,      // 28 minutes
    "stackoverflow.com": 900000, // 15 minutes  
    "localhost:3000": 240000     // 4 minutes
  },
  "tabSwitches": 23,
  "totalTabs": 8,
  "topDomains": [
    { "domain": "github.com", "timeMinutes": 28, "percentage": 60 },
    { "domain": "stackoverflow.com", "timeMinutes": 15, "percentage": 32 }
  ]
}
```

### AI Enhancement
With this data, the AI can generate much more accurate insights:

**Before (Basic)**:
- Summary: "45-minute coding session"
- Next Steps: Generic suggestions

**After (With Browser Data)**:
- Summary: "Focused 28-minute GitHub session with occasional Stack Overflow research"
- Next Steps: "Continue the current feature, consider bookmarking that Stack Overflow thread"
- Pattern Analysis: "Low distraction session - only 23 tab switches across 8 tabs"

## 🔧 **Technical Details**

### Permissions Required
- `tabs`: Monitor tab changes and URLs
- `activeTab`: Get current active tab information  
- `storage`: Store tracking data locally
- `background`: Run tracking in background
- `scripting`: Inject tracking scripts

### Privacy & Security
- ✅ **Local First**: All tracking happens locally in your browser
- ✅ **Explicit Consent**: Only tracks when you explicitly start a session
- ✅ **Secure Sync**: Data only syncs to your authenticated app session
- ✅ **No External Services**: Extension doesn't send data to third parties

### Data Storage
- Browser extension stores data locally
- Syncs to your main app only during active sessions
- No persistent cross-session tracking

## 🔍 **Troubleshooting**

### Extension Not Appearing
1. Check Developer Mode is enabled
2. Refresh the extensions page
3. Try reloading the unpacked extension

### Sync Issues
1. Ensure main app is running on `localhost:3000`
2. Check you're logged into the same account
3. Try the "Sync with App" button manually

### Permission Warnings
1. All permissions are needed for proper tracking
2. Extension only tracks during active sessions
3. Review the privacy section above for details

## 🎨 **Customization**

### Productivity Categories
Edit `background.js` to customize site categories:

```javascript
// Add your own productivity rules
if (domain.includes('yourworksite.com')) activityType = 'WORK';
else if (domain.includes('youtube.com')) activityType = 'DISTRACTION';
```

### Update Intervals
Modify tracking frequency in `popup.js`:

```javascript
// Change update frequency (default: 5 seconds)
updateInterval = setInterval(updateStatus, 5000);
```

## 🚧 **Development**

### Local Development
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click refresh icon on the extension
4. Test changes immediately

### Adding Features
- Edit `background.js` for tracking logic
- Edit `popup.html` + `popup.js` for UI
- Update `manifest.json` for new permissions

## 🤝 **Integration**

The extension works seamlessly with your main Ultradian app:
- Automatic session detection
- Real-time data sync
- Enhanced AI analysis
- Productivity insights

This gives you the complete picture of your focus sessions with both self-reported goals AND actual browsing behavior. 