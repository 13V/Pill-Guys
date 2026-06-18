import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';

export const ROOT = path.dirname(fileURLToPath(import.meta.url));

// Reads config.json if present, otherwise falls back to config.example.json.
export function loadConfig() {
  const userPath = path.join(ROOT, 'config.json');
  const examplePath = path.join(ROOT, 'config.example.json');
  const usingExample = !fs.existsSync(userPath);
  if (usingExample) {
    console.warn(
      '⚠  No config.json found — using config.example.json defaults.\n' +
        '   Copy it to config.json and edit before doing anything real.\n',
    );
  }
  return JSON.parse(fs.readFileSync(usingExample ? examplePath : userPath, 'utf8'));
}

export function normalizeNetwork(network) {
  const v = (network || 'devnet').toLowerCase();
  if (v === 'mainnet' || v === 'mainnet-beta') return 'mainnet-beta';
  if (v === 'testnet') return 'testnet';
  return 'devnet';
}

export const isMainnet = (network) => normalizeNetwork(network) === 'mainnet-beta';

export function getConnection(cfg) {
  const url =
    cfg.rpcUrl && cfg.rpcUrl.trim()
      ? cfg.rpcUrl.trim()
      : clusterApiUrl(normalizeNetwork(cfg.network));
  return new Connection(url, 'confirmed');
}

// Hard stop before doing anything that costs real money.
export function assertMainnetConfirmed(cfg) {
  if (isMainnet(cfg.network) && process.env.CONFIRM_MAINNET !== 'yes') {
    throw new Error(
      'Refusing to run on MAINNET without confirmation.\n' +
        'This spends real SOL and is IRREVERSIBLE.\n' +
        'If you are sure, re-run with:  CONFIRM_MAINNET=yes npm run <script>',
    );
  }
}

export async function loadPayer(cfg, connection, { allowCreate = false } = {}) {
  const kpPath = path.resolve(ROOT, cfg.keypairPath || './keypairs/payer.json');

  if (fs.existsSync(kpPath)) {
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(kpPath, 'utf8')));
    return Keypair.fromSecretKey(secret);
  }

  if (!allowCreate || isMainnet(cfg.network)) {
    throw new Error(
      `Keypair not found at ${kpPath}.\n` +
        'Create and fund a wallet, then point "keypairPath" at its JSON file.',
    );
  }

  // Devnet convenience: spin up a throwaway funded wallet.
  const kp = Keypair.generate();
  fs.mkdirSync(path.dirname(kpPath), { recursive: true });
  fs.writeFileSync(kpPath, JSON.stringify(Array.from(kp.secretKey)));
  console.log(`🔑 Generated dev keypair: ${kpPath}`);
  console.log(`   Address: ${kp.publicKey.toBase58()}`);
  await airdrop(connection, kp.publicKey);
  return kp;
}

async function airdrop(connection, pubkey, sol = 1) {
  try {
    console.log('💧 Requesting devnet airdrop…');
    const sig = await connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, ...latest }, 'confirmed');
    console.log('   Airdrop confirmed.\n');
  } catch {
    console.warn('   Airdrop failed (the devnet faucet is often rate-limited).');
    console.warn('   Fund it at https://faucet.solana.com/ and re-run.\n');
  }
}

export function explorerUrl(address, cfg, type = 'address') {
  const net = normalizeNetwork(cfg.network);
  const suffix = net === 'mainnet-beta' ? '' : `?cluster=${net}`;
  return `https://explorer.solana.com/${type}/${address}${suffix}`;
}

export function saveMintInfo(info) {
  fs.writeFileSync(
    path.join(ROOT, '.mint-address.json'),
    JSON.stringify(info, null, 2),
  );
}

export function loadMintInfo() {
  const p = path.join(ROOT, '.mint-address.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}
