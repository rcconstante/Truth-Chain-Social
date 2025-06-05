import { Buffer } from 'buffer';

// Make Buffer available globally for algosdk
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer; 