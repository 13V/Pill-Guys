// Creates the PILL SPL token mint, an associated token account, and mints the
// initial supply to the payer. Defaults to devnet. Does NOT revoke authorities
// (do that explicitly later with `npm run revoke-authority`).
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import {
  loadConfig,
  getConnection,
  loadPayer,
  assertMainnetConfirmed,
  explorerUrl,
  saveMintInfo,
  normalizeNetwork,
} from './lib.js';

const cfg = loadConfig();
assertMainnetConfirmed(cfg);

const connection = getConnection(cfg);
const payer = await loadPayer(cfg, connection, { allowCreate: true });
const decimals = cfg.decimals ?? 9;
const supply = BigInt(cfg.supply ?? 0);

console.log(`Network: ${normalizeNetwork(cfg.network)}`);
console.log(`Payer:   ${payer.publicKey.toBase58()}\n`);

// Mint authority + freeze authority both start as the payer.
const mint = await createMint(
  connection,
  payer,
  payer.publicKey,
  payer.publicKey,
  decimals,
);
console.log(`✅ Mint created: ${mint.toBase58()}`);

const ata = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  payer.publicKey,
);

if (supply > 0n) {
  const rawAmount = supply * 10n ** BigInt(decimals);
  await mintTo(connection, payer, mint, ata.address, payer, rawAmount);
  console.log(`✅ Minted ${supply.toLocaleString()} PILL to ${ata.address.toBase58()}`);
}

saveMintInfo({
  mint: mint.toBase58(),
  tokenAccount: ata.address.toBase58(),
  decimals,
  supply: cfg.supply ?? 0,
  network: normalizeNetwork(cfg.network),
  createdAt: new Date().toISOString(),
});

console.log(`\n🔎 ${explorerUrl(mint.toBase58(), cfg)}`);
console.log('\nNext steps:');
console.log('  1. Host an off-chain metadata JSON (see token/metadata/).');
console.log('  2. Put its URL in metadata.json, then run:  npm run set-metadata');
console.log('  3. When ready to lock supply:               npm run revoke-authority');
