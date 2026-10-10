/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_ENABLE_STORAGE_UPLOADS: string;
  readonly VITE_USE_FIREBASE_EMULATORS: string;
  readonly VITE_GA4_MEASUREMENT_ID: string;
  readonly VITE_CLARITY_PROJECT_ID: string;
  readonly VITE_GOOGLE_SITE_VERIFICATION: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
