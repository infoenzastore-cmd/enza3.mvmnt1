import { PollarClient, WalletType } from '@pollar/core';

// Pollar's publishable Testnet key is intentionally public. Never put a secret key here.
const POLLAR_KEY = 'pub_testnet_0d085cabce6cbe577833ca20ab53ef9e';
const dialog = document.querySelector('#wallet-dialog');
const trigger = document.querySelector('#wallet-trigger');
const status = document.querySelector('#wallet-status');
const address = document.querySelector('#wallet-address');
const details = document.querySelector('#wallet-details');
const loginActions = document.querySelector('#wallet-login-actions');
const explorer = document.querySelector('#wallet-explorer');
const pollarLogin = document.querySelector('#pollar-login');
const freighterLogin = document.querySelector('#freighter-login');
let client;
let walletType;
let busy = false;
let lastError = '';

function setStatus(message) {
  status.textContent = message;
}

function currentWallet() {
  const wallets = client?.getWallets?.() || [];
  return wallets.find(wallet => wallet.chain === 'STELLAR') || client?.getWallet?.() || null;
}

function render() {
  const auth = client?.getAuthState?.();
  const wallet = currentWallet();
  const connected = auth?.step === 'authenticated' && !!wallet?.address;
  details.hidden = !connected;
  loginActions.hidden = auth?.step === 'authenticated';
  pollarLogin.disabled = busy || !client;
  freighterLogin.disabled = busy || !client;
  trigger.textContent = connected ? 'Wallet connected' : 'Wallet';
  if (lastError) {
    setStatus(lastError);
  } else if (connected) {
    address.textContent = wallet.address;
    explorer.href = `https://testnet.stellar.expert/explorer/testnet/account/${encodeURIComponent(wallet.address)}`;
    setStatus(wallet.provisioning === 'CREATING'
      ? 'Your Testnet wallet is being set up.'
      : 'Connected on Stellar Testnet. Your address is shown below.');
  } else if (auth?.step === 'authenticated') {
    setStatus('Signed in. Waiting for your Stellar Testnet wallet.');
  } else if (auth?.step === 'error') {
    setStatus(auth.details || 'Wallet sign-in failed. Please try again.');
  } else if (auth?.step && auth.step !== 'idle') {
    setStatus('Completing wallet sign-in…');
  } else if (client) {
    setStatus('Choose Pollar or Freighter to connect on Stellar Testnet.');
  }
}

async function connect(provider) {
  if (!client || busy) return;
  busy = true;
  lastError = '';
  render();
  setStatus(provider === walletType.FREIGHTER
    ? 'Waiting for Freighter approval. Select Stellar Testnet in Freighter.'
    : 'Opening Pollar sign-in…');
  try {
    await client.login({ provider });
    render();
  } catch (error) {
    lastError = error?.message || 'Wallet sign-in failed. Check the Testnet network and try again.';
  } finally {
    busy = false;
    render();
  }
}

trigger.addEventListener('click', () => dialog.showModal());
document.querySelector('#wallet-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
pollarLogin.addEventListener('click', () => connect('google'));
freighterLogin.addEventListener('click', () => {
  if (walletType) connect(walletType.FREIGHTER);
});
document.querySelector('#wallet-copy').addEventListener('click', async () => {
  const value = currentWallet()?.address;
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    setStatus('Testnet address copied.');
  } catch {
    setStatus('Copy is unavailable in this browser. Select the address above to copy it.');
  }
});
document.querySelector('#wallet-logout').addEventListener('click', async () => {
  if (!client || busy) return;
  busy = true;
  try {
    await client.logout();
    lastError = '';
    setStatus('Disconnected from ENZA.');
  } catch (error) {
    lastError = error?.message || 'Could not disconnect. Please try again.';
  } finally {
    busy = false;
    render();
  }
});

try {
  walletType = WalletType;
  client = new PollarClient({
    apiKey: POLLAR_KEY,
    oauthRedirectUri: new URL('./', location.href).href,
  });
  client.onAuthStateChange(state => {
    if (state.step === 'authenticated') lastError = '';
    render();
  });
  client.onWalletStateChange(render);
  await client.ready();
  render();
} catch (error) {
  setStatus('Wallet connection is temporarily unavailable. Please try again later.');
  console.error('ENZA wallet setup failed:', error);
}
