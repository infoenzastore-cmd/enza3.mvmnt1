import { PollarClient } from '@pollar/core';

const TESTNET_USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const $ = selector => document.querySelector(selector);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function jsonRequest(url, options) {
  const response = await fetch(url, { ...options, headers: { 'content-type': 'application/json', ...options?.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Checkout is unavailable');
  return body;
}

export async function initWalletCheckout({ apiBase, getCartItems, clearCart }) {
  const base = new URL(apiBase);
  if (base.protocol !== 'https:' && base.hostname !== 'localhost' && base.hostname !== '127.0.0.1') throw new Error('Checkout API must use HTTPS');
  const config = await jsonRequest(new URL('/api/config', base));
  if (!config.configured || config.network !== 'Testnet' || config.issuer !== TESTNET_USDC_ISSUER || !config.merchant?.startsWith('G') || !config.pollarPublishableKey?.startsWith('pub_testnet_')) throw new Error('Testnet checkout is not configured');

  $('#wallet-checkout').hidden = false;
  $('#review-title').textContent = 'Your Testnet order';
  $('#review-modal > p:not(.review-disclaimer)').textContent = 'Review the concept collection below. This sample payment uses test USDC and does not reserve inventory or arrange delivery.';
  $('#review-button').textContent = 'Review Testnet order ↗';
  $('.cart-bottom > p').textContent = 'Testnet checkout uses test USDC only. No real product sale or delivery is arranged.';
  $('.payment-preview').hidden = true;
  $('.review-disclaimer').textContent = 'Testnet USDC has no cash value. This sample payment does not place a real product order.';
  const client = new PollarClient({
    apiKey: config.pollarPublishableKey,
    confirmation: 'prompt',
    oauthRedirectUri: new URL('/prototype/', location.origin).href,
  });
  let activeOrder = null;
  let busy = false;
  let activeConfirmation = null;
  const pendingKey = 'enza-testnet-pending-payment-v1';
  let pendingPayment = null;
  try {
    const stored = JSON.parse(localStorage.getItem(pendingKey) || 'null');
    if (stored && /^[a-f0-9-]{36}$/i.test(stored.id) && /^[a-f0-9]{64}$/i.test(stored.hash)) pendingPayment = stored;
  } catch { /* Browser storage may be unavailable. */ }

  const renderWallet = () => {
    const auth = client.getAuthState();
    const wallet = client.getWallet();
    const ready = auth.step === 'authenticated' && wallet?.address?.startsWith('G') && wallet.provisioning !== 'CREATING' && wallet.provisioning !== 'FAILED';
    $('#wallet-action').hidden = auth.step === 'authenticated';
    $('#pay-button').hidden = !ready;
    $('#pay-button').disabled = !ready || busy || !!pendingPayment;
    $('#retry-verification').hidden = !pendingPayment;
    $('#retry-verification').disabled = busy;
    $('#wallet-funding').hidden = !ready;
    $('#wallet-address').hidden = !wallet?.address;
    $('#wallet-address').textContent = wallet?.address ? `Your Testnet wallet: ${wallet.address}` : '';
    if (auth.step === 'authenticated') {
      $('#wallet-status').textContent = !wallet?.address ? 'Signed in. Waiting for your Stellar wallet…' : wallet.provisioning === 'CREATING' ? 'Your Testnet wallet is being set up…' : wallet.provisioning === 'FAILED' ? 'Wallet setup needs attention in Pollar.' : 'Wallet ready for a Testnet payment.';
    } else if (auth.step === 'error') {
      $('#wallet-status').textContent = auth.details || 'Sign-in did not complete. Please try again.';
    } else if (auth.step === 'idle') {
      $('#wallet-status').textContent = 'Sign in to create or reconnect your Stellar Testnet wallet.';
    } else {
      $('#wallet-status').textContent = 'Completing sign-in…';
    }
  };

  client.onAuthStateChange(renderWallet);
  client.onWalletStateChange(renderWallet);
  client.onConfirmationRequest(pending => {
    const dialog = $('#signature-dialog');
    if (!pending.length) {
      activeConfirmation = null;
      if (dialog.open) dialog.close();
      return;
    }
    if (activeConfirmation) return;
    activeConfirmation = pending[0];
    $('#signature-details').textContent = activeOrder
      ? `${activeOrder.amount} Testnet USDC to ${config.merchant}. Order memo: ${activeOrder.memo}.`
      : 'Approve this wallet setup request only if you started it.';
    dialog.showModal();
  });
  $('#signature-approve').addEventListener('click', () => {
    const request = activeConfirmation;
    activeConfirmation = null;
    $('#signature-dialog').close();
    request?.confirm();
  });
  $('#signature-reject').addEventListener('click', () => {
    const request = activeConfirmation;
    activeConfirmation = null;
    $('#signature-dialog').close();
    request?.reject();
  });
  $('#signature-dialog').addEventListener('cancel', event => {
    event.preventDefault();
    $('#signature-reject').click();
  });
  $('#wallet-action').addEventListener('click', () => client.login({ provider: 'google' }));

  const verifyPending = async () => {
    if (!pendingPayment) return;
    $('#payment-result').textContent = 'Checking the submitted payment on Stellar Testnet…';
    let receipt;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        receipt = await jsonRequest(new URL(`/api/orders/${pendingPayment.id}/confirm`, base), {
          method: 'POST', body: JSON.stringify({ hash: pendingPayment.hash }),
        });
        break;
      } catch (error) {
        if (/Wrong|Incorrect|expired|already used|Invalid/i.test(error.message) || attempt === 7) throw error;
        await pause(2000);
      }
    }
    if (receipt?.status !== 'paid') throw new Error('Payment has not been verified yet');
    pendingPayment = null;
    try { localStorage.removeItem(pendingKey); } catch { /* Storage may be unavailable. */ }
    clearCart();
    $('#payment-result').textContent = `Testnet payment verified. Order ${receipt.id.slice(0, 8)}. `;
    const link = document.createElement('a');
    link.href = receipt.explorer;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View on Stellar Expert';
    $('#payment-result').append(link);
  };

  $('#retry-verification').addEventListener('click', async () => {
    if (!pendingPayment || busy) return;
    busy = true;
    renderWallet();
    try { await verifyPending(); }
    catch (error) { $('#payment-result').textContent = `${error.message}. Please retry verification; do not send again.`; }
    finally { busy = false; renderWallet(); }
  });

  $('#pay-button').addEventListener('click', async () => {
    if (busy) return;
    const wallet = client.getWallet();
    const items = getCartItems();
    if (!wallet?.address || !items.length) return;
    busy = true;
    renderWallet();
    $('#payment-result').textContent = 'Creating your Testnet order…';
    try {
      activeOrder = await jsonRequest(new URL('/api/checkout/orders', base), {
        method: 'POST', body: JSON.stringify({ customerAddress: wallet.address, items }),
      });
      $('#payment-result').textContent = `Reviewing ${activeOrder.amount} test USDC in your wallet…`;
      const outcome = await client.sendPayment({
        chain: 'STELLAR', destination: config.merchant, amount: activeOrder.amount,
        asset: { type: 'credit_alphanum4', code: 'USDC', issuer: config.issuer },
        options: { memo: { type: 'text', value: activeOrder.memo } },
      });
      if (outcome.status === 'error') throw new Error(outcome.details || outcome.message || outcome.code || 'Payment was not sent');
      if (!outcome.hash) throw new Error('Payment is awaiting a wallet approval. Return after it is submitted.');
      pendingPayment = { id: activeOrder.id, hash: outcome.hash };
      try { localStorage.setItem(pendingKey, JSON.stringify(pendingPayment)); } catch { /* The current page still retains it. */ }
      await verifyPending();
    } catch (error) {
      $('#payment-result').textContent = pendingPayment
        ? `${error.message || 'Verification is pending'}. Retry verification; do not send again.`
        : error.message || 'The Testnet payment could not be completed.';
    } finally {
      busy = false;
      activeOrder = null;
      renderWallet();
    }
  });

  await client.ready();
  renderWallet();
  if (pendingPayment) $('#payment-result').textContent = 'A submitted Testnet payment is awaiting verification. Do not send again.';
}
