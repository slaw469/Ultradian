export interface ExtensionPreferences {
  dismissed: boolean;
  dismissCount: number;
  lastDismissed: number | null;
  reminderFrequency: 'never' | 'weekly' | 'monthly';
  installationPrompted: boolean;
}

export interface ExtensionStatus {
  installed: boolean;
  communicating: boolean;
  version?: string;
}

const EXTENSION_PREFS_KEY = 'ultradian_extension_prefs';
const EXTENSION_ID = 'your-extension-id'; // Replace with actual extension ID

export class ExtensionDetector {
  private static instance: ExtensionDetector;
  private status: ExtensionStatus = { installed: false, communicating: false };
  private preferences: ExtensionPreferences;

  private constructor() {
    this.preferences = this.loadPreferences();
  }

  static getInstance(): ExtensionDetector {
    if (!ExtensionDetector.instance) {
      ExtensionDetector.instance = new ExtensionDetector();
    }
    return ExtensionDetector.instance;
  }

  private loadPreferences(): ExtensionPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences();
    }

    try {
      const saved = localStorage.getItem(EXTENSION_PREFS_KEY);
      if (saved) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load extension preferences:', error);
    }
    
    return this.getDefaultPreferences();
  }

  private getDefaultPreferences(): ExtensionPreferences {
    return {
      dismissed: false,
      dismissCount: 0,
      lastDismissed: null,
      reminderFrequency: 'weekly',
      installationPrompted: false,
    };
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(EXTENSION_PREFS_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save extension preferences:', error);
    }
  }

  async checkExtensionStatus(): Promise<ExtensionStatus> {
    if (typeof window === 'undefined') {
      return { installed: false, communicating: false };
    }

    try {
      // Method 1: Try to communicate with extension
      const response = await this.pingExtension();
      if (response) {
        this.status = { installed: true, communicating: true, version: response.version };
        return this.status;
      }

      // Method 2: Check for extension-injected elements
      const extensionMarker = document.querySelector('[data-ultradian-extension]');
      if (extensionMarker) {
        this.status = { installed: true, communicating: false };
        return this.status;
      }

      // Method 3: Check for extension global variables
      if ((window as any).ultradiancx?._isInstalled) {
        this.status = { installed: true, communicating: false };
        return this.status;
      }

      this.status = { installed: false, communicating: false };
      return this.status;
    } catch (error) {
      console.error('Extension detection failed:', error);
      this.status = { installed: false, communicating: false };
      return this.status;
    }
  }

  private async pingExtension(): Promise<{ version: string } | null> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => resolve(null), 1000);

      // Send message to extension
      window.postMessage({ type: 'ULTRADIAN_PING', source: 'webpage' }, '*');

      // Listen for response
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'ULTRADIAN_PONG' && event.data?.source === 'extension') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          resolve({ version: event.data.version || '1.0.0' });
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  getPreferences(): ExtensionPreferences {
    return { ...this.preferences };
  }

  dismissPrompt(): void {
    this.preferences.dismissed = true;
    this.preferences.dismissCount += 1;
    this.preferences.lastDismissed = Date.now();
    this.savePreferences();
  }

  resetDismissal(): void {
    this.preferences.dismissed = false;
    this.savePreferences();
  }

  setReminderFrequency(frequency: 'never' | 'weekly' | 'monthly'): void {
    this.preferences.reminderFrequency = frequency;
    this.savePreferences();
  }

  markInstallationPrompted(): void {
    this.preferences.installationPrompted = true;
    this.savePreferences();
  }

  shouldShowPrompt(): boolean {
    // Don't show if extension is already installed
    if (this.status.installed) return false;

    // Don't show if user set frequency to never
    if (this.preferences.reminderFrequency === 'never') return false;

    // Don't show if dismissed more than 3 times
    if (this.preferences.dismissCount >= 3) return false;

    // Don't show if recently dismissed
    if (this.preferences.lastDismissed) {
      const timeSinceDismiss = Date.now() - this.preferences.lastDismissed;
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      const monthInMs = 30 * 24 * 60 * 60 * 1000;

      switch (this.preferences.reminderFrequency) {
        case 'weekly':
          return timeSinceDismiss > weekInMs;
        case 'monthly':
          return timeSinceDismiss > monthInMs;
        default:
          return false;
      }
    }

    return true;
  }

  getInstallationUrl(): string {
    return `https://chrome.google.com/webstore/detail/${EXTENSION_ID}`;
  }

  getCurrentStatus(): ExtensionStatus {
    return { ...this.status };
  }
}

// Export singleton instance
export const extensionDetector = ExtensionDetector.getInstance(); 