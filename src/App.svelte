<script lang="ts">
    import Onboarding from './components/Onboarding.svelte';
    import { authContext } from './lib/auth.svelte';

    // Système de navigation ultra-simple
    let currentPage = $state('onboarding');

    // On peut changer de page facilement
    function navigate(page: string) {
        currentPage = page;
    }
</script>

<nav class="top-bar">
    <span>AURION VAULT v2</span>
    {#if authContext.isAuthenticated}
        <button onclick={() => navigate('dashboard')}>Dashboard</button>
        <button onclick={() => navigate('recovery')}>Recovery</button>
    {/if}
</nav>

<main>
    {#if currentPage === 'onboarding'}
        <Onboarding />
    
    {/if}
</main>

<style>
    /* Ton CSS global ici */
    :global(body) { background: #0d1117; color: #c9d1d9; font-family: monospace; }
    .top-bar { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #30363d; }
</style>