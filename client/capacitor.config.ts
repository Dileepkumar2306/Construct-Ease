import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.constructease.app',
  appName: 'Construct Ease',
  webDir: 'dist/client/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
