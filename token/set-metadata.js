// Attaches Metaplex Token Metadata (name / symbol / image URI) to the mint
// created by create-token.js. Run this BEFORE revoking the mint authority.
import fs from 'node:fs';
import path from 'node:path';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey, none } from '@metaplex-foundation/umi';
import {
  createMetadataAccountV3,
  findMetadataPda,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  loadConfig,
  loadMintInfo,
  getConnection,
  assertMainnetConfirmed,
  explorerUrl,
  ROOT,
} from './lib.js';

const cfg = loadConfig();
assertMainnetConfirmed(cfg);

const mintAddress = (cfg.mint && cfg.mint.trim()) || loadMintInfo()?.mint;
if (!mintAddress) {
  throw new Error(
    'No mint address. Run `npm run create-token` first, or set "mint" in config.json.',
  );
}

// On-chain metadata fields.
const metaFile = path.join(ROOT, 'metadata.json');
const metaExample = path.join(ROOT, 'metadata.example.json');
const md = JSON.parse(
  fs.readFileSync(fs.existsSync(metaFile) ? metaFile : metaExample, 'utf8'),
);

const connection = getConnection(cfg);
const umi = createUmi(connection.rpcEndpoint);

const kpPath = path.resolve(ROOT, cfg.keypairPath || './keypairs/payer.json');
const secret = Uint8Array.from(JSON.parse(fs.readFileSync(kpPath, 'utf8')));
umi.use(keypairIdentity(umi.eddsa.createKeypairFromSecretKey(secret)));

const mint = publicKey(mintAddress);
const metadata = findMetadataPda(umi, { mint });

await createMetadataAccountV3(umi, {
  metadata,
  mint,
  mintAuthority: umi.identity,
  payer: umi.identity,
  updateAuthority: umi.identity.publicKey,
  data: {
    name: md.name,
    symbol: md.symbol,
    uri: md.uri,
    sellerFeeBasisPoints: md.sellerFeeBasisPoints ?? 0,
    creators: none(),
    collection: none(),
    uses: none(),
  },
  isMutable: true,
  collectionDetails: none(),
}).sendAndConfirm(umi);

console.log(`✅ Metadata set: ${md.name} (${md.symbol})`);
console.log(`🔎 ${explorerUrl(mintAddress, cfg)}`);
