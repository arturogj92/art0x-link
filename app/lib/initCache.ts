// lib/initCache.ts
import { loadUrlCache } from "./cache";

loadUrlCache().then(() => console.log("Cache inicializada"));
