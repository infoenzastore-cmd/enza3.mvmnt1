import test from 'node:test';import assert from 'node:assert/strict';
import { Account, Asset, Keypair, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { createOrder, verifyPayment, amountToUnits, validateSignedPayment, payoutAmount, payoutMemo, verifyPayout, validateSignedTrustline } from '../payment.js';
const hash='a'.repeat(64), issuer='GISSUER', merchant='GMERCHANT';
function fixture(){const order=createOrder('antidote');const tx={hash,successful:true,memo_type:'text',memo:order.memo,created_at:new Date().toISOString()};const ops=[{type:'payment',to:merchant,asset_code:'USDC',asset_issuer:issuer,amount:order.amount}];return {order,tx,ops}}
test('exact payment creates one demo ticket and repeated confirmation is stable',()=>{const {order,tx,ops}=fixture();const paid=verifyPayment(order,hash,tx,ops,{issuer,merchant},new Set());assert.equal(paid.status,'paid');assert.match(paid.ticket,/^DEMO-/);assert.deepEqual(verifyPayment(paid,hash,tx,ops,{issuer,merchant},new Set([hash])),paid)});
test('rejects wrong asset, amount, destination, memo, failed and duplicate',()=>{for(const changed of [{ops:[{asset_issuer:'other'}]},{ops:[{amount:'1.0000000'}]},{ops:[{to:'other'}]},{tx:{memo:'other'}},{tx:{successful:false}},{used:new Set([hash])}]){const {order,tx,ops}=fixture();Object.assign(tx,changed.tx);if(changed.ops)Object.assign(ops[0],changed.ops[0]);assert.throws(()=>verifyPayment(order,hash,tx,ops,{issuer,merchant},changed.used||new Set()))}});
test('rejects expired payment',()=>{const {order,tx,ops}=fixture();order.expiresAt='2020-01-01T00:00:00Z';assert.throws(()=>verifyPayment(order,hash,tx,ops,{issuer,merchant},new Set()))});
test('amounts use integer stroops',()=>{assert.equal(amountToUnits('12.5000000'),125000000n);assert.throws(()=>amountToUnits('0.00000001'))});
test('parsed Stellar XDR preserves payment details and decodes memo bytes',()=>{
 const order=createOrder('bottle');
 const source=Keypair.random().publicKey(),destination=Keypair.random().publicKey(),assetIssuer=Keypair.random().publicKey();
 const config={merchant:destination,issuer:assetIssuer};
 const account=new Account(source,'1');
 const makeXdr=(amount,memo)=>new TransactionBuilder(account,{fee:'100',networkPassphrase:Networks.TESTNET})
  .addOperation(Operation.payment({destination,asset:new Asset('USDC',assetIssuer),amount}))
  .addMemo(Memo.text(memo)).setTimeout(60).build();
 const parse=xdr=>TransactionBuilder.fromXDR(xdr,Networks.TESTNET);
 const makeSigned=(amount,memo)=>{const tx=makeXdr(amount,memo);tx.sign(Keypair.random());return parse(tx.toXDR())};
 assert.doesNotThrow(()=>validateSignedPayment(makeSigned(order.amount,order.memo),order,config));
 assert.throws(()=>validateSignedPayment(makeSigned('11.0000000',order.memo),order,config),/details changed/);
 assert.throws(()=>validateSignedPayment(makeSigned(order.amount,'wrong'),order,config),/does not match/);
});
test('payout allocation and ledger match are exact',()=>{
 const {order}=fixture();order.status='paid';order.paidAt=order.createdAt;order.payout={status:'submitted',amount:payoutAmount(order.amount),vendor:'GVENDOR',hash};
 assert.equal(payoutAmount('5.0000000'),'4.5000000');
 assert.match(payoutMemo(order),/^ENZA-/);
 const tx={hash,successful:true,source_account:merchant,memo_type:'text',memo:payoutMemo(order),created_at:new Date().toISOString()};
 const op={type:'payment',from:merchant,to:'GVENDOR',asset_code:'USDC',asset_issuer:issuer,amount:order.payout.amount};
 const config={merchant,vendor:'GVENDOR',issuer};
 assert.equal(verifyPayout(order,hash,tx,[op],config,new Set()).payout.status,'paid');
 assert.throws(()=>verifyPayout(order,hash,tx,[{...op,to:'OTHER'}],config,new Set()),/Incorrect payout/);
});
test('trustline signature must match the prepared Circle test USDC intent',()=>{
 const signer=Keypair.random(),issuer=Keypair.random().publicKey(),other=Keypair.random().publicKey();
 const account=new Account(signer.publicKey(),'1');
 const make=asset=>{const tx=new TransactionBuilder(account,{fee:'100',networkPassphrase:Networks.TESTNET}).addOperation(Operation.changeTrust({asset})).setTimeout(60).build();tx.sign(signer);return tx};
 const tx=make(new Asset('USDC',issuer)),hash=tx.hash().toString('hex');
 assert.doesNotThrow(()=>validateSignedTrustline(tx,signer.publicKey(),{issuer},hash));
 assert.throws(()=>validateSignedTrustline(tx,signer.publicKey(),{issuer},'a'.repeat(64)),/intent changed/);
 assert.throws(()=>validateSignedTrustline(make(new Asset('USDC',other)),signer.publicKey(),{issuer},hash),/intent changed/);
});
