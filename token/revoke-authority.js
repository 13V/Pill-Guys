// Permanently revokes the mint and/or freeze authority based on config flags.
// IRREVERSIBLE: revoking the mint authority fixes the supply forever.
import { PublicKey } from '@solana/web3.js';
import { setAuthority, AuthorityType } from '@solana/spl-token';
import {
  loadConfig,
  getConnection,
  loadPayer,
  loadMintInfo,
  assertMainnetConfirmed,
  explorerUrl,
} from './lib.js';

const cfg = loadConfig();
assertMainnetConfirmed(cfg);

const mintAddress = (cfg.mint && cfg.mint.trim()) || loadMintInfo()?.mint;
if (!mintAddress) throw new Error('No mint address found. Run create-token first.');

if (!cfg.revokeMintAuthority && !cfg.revokeFreezeAuthority) {
  console.log(
    'Nothing to do. Set "revokeMintAuthority" and/or "revokeFreezeAuthority" to true in config.json.',
  );
  process.exit(0);
}

const connection = getConnection(cfg);
const payer = await loadPayer(cfg, connection);
const mint = new PublicKey(mintAddress);

console.log('⚠  Revoking authorities is IRREVERSIBLE.\n');

if (cfg.revokeMintAuthority) {
  await setAuthority(
    connection,
    payer,
    mint,
    payer.publicKey,
    AuthorityType.MintTokens,
    null,
  );
  console.log('✅ Mint authority revoked — total supply is now fixed.');
}

if (cfg.revokeFreezeAuthority) {
  await setAuthority(
    connection,
    payer,
    mint,
    payer.publicKey,
    AuthorityType.FreezeAccount,
    null,
  );
  console.log('✅ Freeze authority revoked.');
}

console.log(`\n🔎 ${explorerUrl(mintAddress, cfg)}`);
