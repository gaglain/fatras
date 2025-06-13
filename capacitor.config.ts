
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1430f060d6304b55b692677815f70ace',
  appName: 'fatras',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://1430f060-d630-4b55-b692-677815f70ace.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#000000'
    }
  }
};

export default config;
