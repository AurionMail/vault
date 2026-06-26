import { AurionApiClient } from 'aurion-crypto-sdk';

// src/lib/api.ts
const API_BASE = (window as any).AURION_CONFIG?.API_BASE || "http://localhost:8080";

if (!API_BASE) {
    throw new Error("Missing environment variable: VITE_AURION_API_BASE");
}

// Instance unique du client API pour l'application
export const aurionApi = new AurionApiClient(API_BASE);

/**
 * Interface pour harmoniser les données de l'utilisateur une fois récupérées
 * Le SDK utilise des types spécifiques, on peut les ré-exporter ou les wrapper
 */
export interface IdentityMetadata {
    id: string;
    type: 'primary' | 'alias' | 'group';
    wkd_hash: string;
}

/**
 * On conserve une méthode de haut niveau pour le dashboard qui n'est pas 
 * forcément dans le SDK Client (ex: liste des identités)
 */
export const AppAPI = {
    async getUserIdentities(email: string): Promise<IdentityMetadata[]> {
        // Note: Si le SDK ne fournit pas encore cette route, on utilise le fetch avec le token du client
        const res = await fetch(`${API_BASE}/user/identities?email=${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${(aurionApi as any).token}`
            }
        });
        if (!res.ok) throw new Error("Failed to fetch identities");
        return res.json();
    }
};