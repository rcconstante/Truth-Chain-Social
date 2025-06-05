/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_TAVUS_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
  readonly VITE_ALGORAND_API_TOKEN: string;
  readonly VITE_ALGORAND_MAINNET_URL: string;
  readonly VITE_ALGORAND_TESTNET_URL: string;
  readonly VITE_ALGORAND_INDEXER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 