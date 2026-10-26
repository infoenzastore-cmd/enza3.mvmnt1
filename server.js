import http from 'node:http';
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Horizon, TransactionBuilder } from '@stellar/stellar-sdk';
import { CATALOG, HORIZON_URL, NETWORK, buildPayment, buildPayout, buildTrustline, configFromEnv, createOrder, payoutAmount, validateSignedPayment, validateSignedPayout, validateSignedTrustline, verifyPayment, verifyPayout } from './payment.js';
const dbPath=new URL('./.data/orders.json',import.meta.url);
const distUrl=new URL('./dist/',import.meta.url);
mkdirSync(new URL('./.data/',import.meta.url),{recursive:true});
let orders=existsSync(dbPath)?JSON.parse(readFileSync(dbPath,'utf8')):{};
const save=()=>{writeFileSync(new URL('./.data/orders.tmp',import.meta.url),JSON.stringify(orders));renameSync(new URL('./.data/orders.tmp',import.meta.url),dbPath)};
const horizon=new Horizon.Server(HORIZON_URL);
const inFlight=new Map();
const pendingTrustlines=new Map();
const allowedOrigin=process.env.PUBLIC_ORIGIN||`http://127.0.0.1:${process.env.PORT||3000}`;
const send=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','access-control-allow-origin':allowedOrigin,'vary':'Origin','cache-control':'no-store'});res.end(JSON.stringify(data))};
const servePage=(pathname,res)=>{
 const path=pathname==='/'?'/index.html':pathname;
 if(!['/index.html','/demo.html','/blueprint.html'].includes(path)&&!/^\/assets\/[a-zA-Z0-9._-]+$/.test(path))return false;
 const file=new URL('.'+path,distUrl);
 if(!existsSync(file)){send(res,404,{error:'Build the demo with npm run build first'});return true}
 const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'}[extname(path)]||'application/octet-stream';
 res.writeHead(200,{'content-type':type,'cache-control':'no-store'});res.end(readFileSync(file));return true;
};
const body=async req=>{let s='';for await(const chunk of req){s+=chunk;if(s.length>20000)throw Error('Request too large')}return JSON.parse(s||'{}')};
const publicOrder=o=>({id:o.id,itemId:o.itemId,kind:o.kind,amount:o.amount,status:o.status,expiresAt:o.expiresAt,memo:o.memo,payer:o.payer,hash:o.hash,ticket:o.ticket,explorer:o.hash?`https://stellar.expert/explorer/testnet/tx/${o.hash}`:null,payout:o.payout?{status:o.payout.status,amount:o.payout.amount,vendor:o.payout.vendor,hash:o.payout.hash,explorer:o.payout.hash?`https://stellar.expert/explorer/testnet/tx/${o.payout.hash}`:null}:null});
const pendingWork=(key,fn)=>{if(!inFlight.has(key))inFlight.set(key,fn().finally(()=>inFlight.delete(key)));return inFlight.get(key)};
export async function handleRequest(req,res){
 try {
  if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':allowedOrigin,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'Content-Type','vary':'Origin'});return res.end()}
  if(req.method==='POST'&&req.headers?.origin&&req.headers.origin!==allowedOrigin)throw Error('Origin is not allowed');
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/api/config'){let paymentConfig;try{paymentConfig=configFromEnv()}catch{}return send(res,200,{network:'Testnet',networkPassphrase:NETWORK,configured:!!paymentConfig,issuer:paymentConfig?.issuer??null,merchant:paymentConfig?.merchant??null,vendor:paymentConfig?.vendor??null,items:Object.entries(CATALOG).map(([id,v])=>({id,name:v.name,kind:v.kind,amount:(Number(v.units)/1e7).toFixed(2)}))})}
  const trustlineMatch=url.pathname.match(/^\/api\/trustline\/(status|build|submit)$/);
  if(trustlineMatch){
   const config=configFromEnv(),action=trustlineMatch[1];
   if(req.method==='GET'&&action==='status'){
    const address=url.searchParams.get('address');
    if(!address||!/^G[A-Z2-7]{55}$/.test(address))throw Error('Invalid wallet address');
    const account=await horizon.loadAccount(address);
    const usdc=account.balances.find(b=>b.asset_code==='USDC'&&b.asset_issuer===config.issuer);
    return send(res,200,{address,ready:!!usdc,usdc:usdc?.balance||'0',xlm:account.balances.find(b=>b.asset_type==='native')?.balance||'0'});
   }
   if(req.method==='POST'&&action==='build'){
    const {address}=await body(req);const xdr=await buildTrustline(address,config,horizon);
    if(!xdr)return send(res,200,{ready:true});
    const hash=TransactionBuilder.fromXDR(xdr,NETWORK).hash().toString('hex');
    pendingTrustlines.set(address,{hash,expiresAt:Date.now()+240000});
    return send(res,200,{ready:false,xdr,hash,issuer:config.issuer});
   }
   if(req.method==='POST'&&action==='submit'){
    const {signedXdr}=await body(req);const tx=TransactionBuilder.fromXDR(signedXdr,NETWORK);
    const prepared=pendingTrustlines.get(tx.source);
    if(!prepared||Date.now()>prepared.expiresAt)throw Error('Trustline setup expired. Build it again.');
    validateSignedTrustline(tx,tx.source,config,prepared.hash);
    await horizon.submitTransaction(tx);pendingTrustlines.delete(tx.source);
    const account=await horizon.loadAccount(tx.source);
    const ready=account.balances.some(b=>b.asset_code==='USDC'&&b.asset_issuer===config.issuer);
    return send(res,200,{ready,hash:prepared.hash,explorer:`https://stellar.expert/explorer/testnet/tx/${prepared.hash}`});
   }
  }
  if(req.method==='POST'&&url.pathname==='/api/orders'){const data=await body(req);configFromEnv();const order=createOrder(data.itemId);orders[order.id]=order;save();return send(res,201,publicOrder(order))}
  const match=url.pathname.match(/^\/api\/orders\/([0-9a-f-]+)(?:\/(build|submit|confirm|payout-build|payout-submit|payout-confirm))?$/);
  if(match){const order=orders[match[1]];if(!order)return send(res,404,{error:'Order not found'});
   const action=match[2];
   if(req.method==='GET'&&!action)return send(res,200,publicOrder(order));
   if(req.method==='POST'&&action==='build')return send(res,200,await pendingWork(`build:${order.id}`,async()=>{
    if(order.status!=='pending'||order.hash)throw Error('Payment already submitted');
    const {payer}=await body(req);
    if(order.payer&&order.payer!==payer)throw Error('This order belongs to another payer');
    if(order.preparedXdr&&order.preparedPayer===payer&&Date.now()<Date.parse(order.preparedUntil))return {xdr:order.preparedXdr,hash:order.preparedHash,order:publicOrder(order)};
    const xdr=await buildPayment(order,payer,configFromEnv(),horizon);
    const tx=TransactionBuilder.fromXDR(xdr,NETWORK);
    order.payer=payer;order.preparedPayer=payer;order.preparedXdr=xdr;order.preparedUntil=new Date(Math.min(Date.parse(order.expiresAt),Date.now()+60000)).toISOString();order.preparedHash=tx.hash().toString('hex');save();
    return {xdr,hash:order.preparedHash,order:publicOrder(order)};
   }));
   if(req.method==='POST'&&action==='submit')return send(res,200,await pendingWork(`submit:${order.id}`,async()=>{
    const {signedXdr}=await body(req);
    if(order.status!=='pending'||!order.preparedHash)throw Error('Build the payment first');
    const tx=TransactionBuilder.fromXDR(signedXdr,NETWORK);
    validateSignedPayment(tx,order,configFromEnv());
    const hash=tx.hash().toString('hex');
    if(order.hash&&order.hash!==hash)throw Error('A different payment was submitted');
    if(!order.hash){order.hash=hash;save();await horizon.submitTransaction(tx)}
    return {hash,explorer:`https://stellar.expert/explorer/testnet/tx/${hash}`};
   }));
   if(req.method==='POST'&&action==='confirm')return send(res,200,await pendingWork(`confirm:${order.id}`,async()=>{
    const {hash}=await body(req);
    if(order.status==='paid'&&order.hash===hash)return publicOrder(order);
    if(order.hash!==hash)throw Error('Hash does not match this order');
    const tx=await horizon.transactions().transaction(hash).call();const ops=await horizon.operations().forTransaction(hash).limit(200).call();
    orders[order.id]=verifyPayment(order,hash,tx,ops.records,configFromEnv(),new Set(Object.values(orders).filter(o=>o.id!==order.id&&o.hash).map(o=>o.hash)));save();return publicOrder(orders[order.id]);
   }));
   if(req.method==='POST'&&action==='payout-build')return send(res,200,await pendingWork(`payout-build:${order.id}`,async()=>{
    if(order.payout?.xdr&&Date.now()<Date.parse(order.payout.preparedUntil)&&!order.payout.hash)return {xdr:order.payout.xdr,hash:order.payout.preparedHash,order:publicOrder(order)};
    const config=configFromEnv();const xdr=await buildPayout(order,config,horizon);
    order.payout={status:'awaiting_signature',amount:payoutAmount(order.amount),vendor:config.vendor,preparedHash:TransactionBuilder.fromXDR(xdr,NETWORK).hash().toString('hex'),preparedUntil:new Date(Date.now()+240000).toISOString(),xdr,hash:null};save();
    return {xdr,hash:order.payout.preparedHash,order:publicOrder(order)};
   }));
   if(req.method==='POST'&&action==='payout-submit')return send(res,200,await pendingWork(`payout-submit:${order.id}`,async()=>{
    const {signedXdr}=await body(req);const tx=TransactionBuilder.fromXDR(signedXdr,NETWORK);validateSignedPayout(tx,order,configFromEnv());
    const hash=tx.hash().toString('hex');if(order.payout.hash&&order.payout.hash!==hash)throw Error('A different payout was submitted');
    if(!order.payout.hash){order.payout.hash=hash;order.payout.status='submitted';save();await horizon.submitTransaction(tx)}
    return {hash,explorer:`https://stellar.expert/explorer/testnet/tx/${hash}`};
   }));
   if(req.method==='POST'&&action==='payout-confirm')return send(res,200,await pendingWork(`payout-confirm:${order.id}`,async()=>{
    const {hash}=await body(req);if(order.payout?.status==='paid'&&order.payout.hash===hash)return publicOrder(order);
    if(order.payout?.hash!==hash)throw Error('Hash does not match this payout');
    const tx=await horizon.transactions().transaction(hash).call();const ops=await horizon.operations().forTransaction(hash).limit(200).call();
    orders[order.id]=verifyPayout(order,hash,tx,ops.records,configFromEnv(),new Set(Object.values(orders).flatMap(o=>[o.hash,o.id===order.id?null:o.payout?.hash]).filter(Boolean)));save();return publicOrder(orders[order.id]);
   }));
  }
  if(req.method==='GET'&&servePage(url.pathname,res))return;
  send(res,404,{error:'Not found'});
 }catch(e){send(res,400,{error:e.message||'Request failed'})}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 http.createServer(handleRequest).listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('ENZA Testnet API listening on '+String(process.env.PORT||3000)));
}
