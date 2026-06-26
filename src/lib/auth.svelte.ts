import { AurionSession } from 'aurion-crypto-sdk';

class AuthState {
    // Utilisation des Runes Svelte 5 pour la réactivité
    #session = $state<AurionSession | null>(null);
    #isAuthenticated = $state<boolean>(false);

    get session() { return this.#session; }
    get isAuthenticated() { return this.#isAuthenticated; }

    login(sessionInstance: AurionSession) {
        this.#session = sessionInstance;
        this.#isAuthenticated = true;
    }

    logout() {
        this.#session = null;
        this.#isAuthenticated = false;
    }
}

export const authContext = new AuthState();