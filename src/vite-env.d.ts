/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENQUIRY_API_URL?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_LEAD_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
