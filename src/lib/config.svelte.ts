// src/lib/config.svelte.ts

export interface AppConfig {
    AURION_API_BASE: string;
}

// État réactif pour la config
let currentConfig = $state<AppConfig | null>(null);

export const appConfig = {
    get current() { return currentConfig; },
    
    async load() {
        try {
            const res = await fetch('/config.json');
            if (!res.ok) throw new Error("Impossible de charger config.json");
            currentConfig = await res.json();
        } catch (e) {
            console.error("Erreur critique de configuration:", e);
            // Fallback pour le développement
            currentConfig = { AURION_API_BASE: "http://localhost:8080" };
        }
    }
};