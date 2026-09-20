import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenin.app',
  appName: 'ZENIN',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
