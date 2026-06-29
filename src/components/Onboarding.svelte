<script lang="ts">
	import { AurionSession, AurionApiClient } from 'aurion-crypto-sdk';
	import { aurionApi } from '../lib/api';
	import { authContext } from '../lib/auth.svelte';

	let step = $state<'INPUT' | 'CRYPTO_PROCESSING' | 'RECOVERY_LOCK' | 'SUCCESS'>('INPUT');
	let loadingMessage = $state('');
	let error = $state('');

	let email = $state('');
	let imapPassword = $state('');
	let imapBlob = $state('');
	let imapConfigMode = $state<'confort' | 'strict'>('strict');
	let userPassword = $state('');

	let generatedMnemonic = $state('');
	let hasCopiedRecovery = $state(false);
	
	// Stockage temporaire pour l'étape finale
	let onboardingContext = $state<{
		session: AurionSession,
		keyMaterial: any,
		salts: any
	} | null>(null);

	async function executeOnboarding() {
		try {
			error = '';
			step = 'CRYPTO_PROCESSING';

			// 1. Récupération des Sels (Nécessaire pour Signup et dérivation)
			loadingMessage = 'Récupération des sels de sécurité...';
			const session = new AurionSession(null);
			const salts = await session.generateSalts();

			// 2. Initialisation Session & Génération de clés (SDK)
			loadingMessage = 'Génération du Keyring OpenPGP ECC et du Mnemonic...';
			
			
			// Simulation de la méthode de génération (comme convenu)
			// 
			const keyMaterial = await session.generateOnboardingKeys(email,userPassword, salts.salt_client);

			// 3. Calcul de h0 et chiffrement IMAP
			loadingMessage = 'Calcul de h0 et scellage des credentials IMAP...';
			await session.unlockVault(userPassword, 'Extreme');
			
			
			if (imapConfigMode === 'confort') {
				imapBlob = await session.encryptMailCredentials(imapPassword);
			}else{
				imapBlob = "";
			}

			onboardingContext = { session, keyMaterial, salts };
			step = 'RECOVERY_LOCK';
		} catch (e: any) {
			error = e.message || 'Échec de la préparation cryptographique';
			step = 'INPUT';
		}
	}

	async function finalizeOnboarding() {
		if (!hasCopiedRecovery || !onboardingContext) return;

		try {
			step = 'CRYPTO_PROCESSING';
			const { session, keyMaterial, salts } = onboardingContext;

			// 1. SIGNUP sur l'API Go
			loadingMessage = "Création du compte sur Aurion API...";
			const authState = await aurionApi.signup(
				email,
				keyMaterial.h0, // Devrait être dérivé de h0
				imapPassword, // Le mdp IMAP non chiffré car juste vérification côté serveur
				imapBlob,
				salts.salt_server,
				salts.salt_client,
			);

			// Injection du token Bearer dans le client API
			aurionApi.setToken(authState.token);

			// 2. UPLOAD PUBLIC KEY
			loadingMessage = "Publication de la clé publique (WKD)...";
	
			await aurionApi.uploadPublicKey(email, keyMaterial.publicKeyArmored);

			// 3. UPLOAD PRIVATE KEY (Chiffrée)
			loadingMessage = "Sauvegarde de l'enveloppe privée chiffrée...";
			await aurionApi.uploadPrivateKey(email, keyMaterial.privateKeyArmored);

			// 4. Finalisation
			authContext.login(session);
			step = 'SUCCESS';
		} catch (e: any) {
			error = e.message || "Erreur lors de la communication avec le serveur";
			step = 'RECOVERY_LOCK';
		}
	}
</script>

<div class="box">
	<h2>[AURION VAULT - ONBOARDING SDK v2]</h2>

	{#if error}
		<div class="banner error">SYSTEM_FAILURE: {error}</div>
	{/if}

	{#if step === 'INPUT'}
		<div class="form-group">
			<label>Email Identitaire :</label>
			<input type="email" bind:value={email} placeholder="user@aurion.cloud" />
		</div>
		<div class="form-group">
			<label>Mot de passe IMAP (Source) :</label>
			<input type="password" bind:value={imapPassword} />
		</div>
		<div class="form-group">
			<label>Mode de stockage :</label>
			<select bind:value={imapConfigMode}>
				<option value="strict">Strict (Aucun stockage distant)</option>
				<option value="confort">Confort (Zero-Knowledge h0)</option>
			</select>
		</div>
		<div class="form-group">
			<label>Mot de passe Vault (Master) :</label>
			<input type="password" bind:value={userPassword} />
		</div>
		<button onclick={executeOnboarding}>INITIALISER LE TUNNEL SÉCURISÉ</button>

	{:else if step === 'CRYPTO_PROCESSING'}
		<div class="loading">
			<div class="spinner"></div>
			<p class="blink">EXECUTING_SECURE_PROTOCOL...</p>
			<p>{loadingMessage}</p>
		</div>

	{:else if step === 'RECOVERY_LOCK'}
		<div class="banner warning">
			URGENT: Sauvegardez ces mots. Ils sont la seule clé de déchiffrement de votre h0 en cas d'oubli.
		</div>
		<div class="mnemonic-display">
			<code>{generatedMnemonic}</code>
		</div>
		<div class="form-group row">
			<input type="checkbox" id="copied" bind:checked={hasCopiedRecovery} />
			<label for="copied">Ma clé de secours est en sécurité (Physique/Coffre).</label>
		</div>
		<button disabled={!hasCopiedRecovery} onclick={finalizeOnboarding}>
			CRÉER LE COMPTE & SYNCHRONISER LES CLÉS
		</button>

	{:else if step === 'SUCCESS'}
		<div class="banner success">COMPTE_CRÉÉ: Votre identité cryptographique est active.</div>
		<button >ENTRER DANS LE VAULT</button>
	{/if}
</div>

<style>
	.box { border: 1px solid #30363d; padding: 30px; background: #161b22; max-width: 500px; margin: auto; }
	.form-group { margin-bottom: 20px; display: flex; flex-direction: column; }
	.form-group.row { flex-direction: row; align-items: center; gap: 10px; }
	label { font-size: 0.8rem; color: #8b949e; margin-bottom: 5px; }
	input, select, button { background: #0d1117; color: #c9d1d9; border: 1px solid #30363d; padding: 10px; font-family: 'Courier New', monospace; }
	button { cursor: pointer; background: #238636; border-color: #2ea043; font-weight: bold; }
	button:disabled { opacity: 0.5; cursor: not-allowed; }
	.mnemonic-display { background: #000; padding: 15px; border: 1px dashed #d29922; color: #e3b341; margin-bottom: 20px; }
	.banner { padding: 10px; margin-bottom: 20px; border-radius: 4px; font-size: 0.9rem; }
	.error { background: rgba(248,81,73,0.1); color: #ff7b72; border: 1px solid #f85149; }
	.warning { background: rgba(210,153,34,0.1); color: #ffa657; border: 1px solid #d29922; }
	.success { background: rgba(56,139,253,0.1); color: #58a6ff; border: 1px solid #388bfd; }
	.blink { animation: blink 1.5s infinite; }
	@keyframes blink { 50% { opacity: 0.5; } }
</style>