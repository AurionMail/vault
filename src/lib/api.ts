import { AurionApiClient } from 'aurion-crypto-sdk';
import { appConfig } from './config.svelte';


export let aurionApi: AurionApiClient;

export function initApi() {
    if (!appConfig.current) throw new Error("Config non chargée");
    aurionApi = new AurionApiClient(appConfig.current.AURION_API_BASE);
}

// Instance unique du client API pour l'application

/**
 * Interface pour harmoniser les données de l'utilisateur une fois récupérées
 * Le SDK utilise des types spécifiques, on peut les ré-exporter ou les wrapper
 */
export interface IdentityMetadata {
    id: string;
    type: 'primary' | 'alias' | 'group';
    wkd_hash: string;
}