# Pill Guys Token (PILL) — Solana scaffold

Scripts to create and configure the **PILL** SPL token. **Scaffold only** — it
defaults to **devnet** and will refuse to touch mainnet unless you explicitly
opt in. Nothing is deployed until *you* run a command.

## Setup

```bash
cd token
npm install
cp config.example.json config.json   # then edit config.json
```

`config.json` fields:

| Field | Meaning |
| ----- | ------- |
| `network` | `devnet` (default), `testnet`, or `mainnet-beta` |
| `rpcUrl` | Custom RPC endpoint (leave `""` to use the public cluster) |
| `keypairPath` | Path to the payer wallet JSON (a `Uint8Array` secret key) |
| `decimals` | Token decimals (9 is standard) |
| `supply` | Initial supply minted to the payer |
| `mint` | Filled in automatically after creation; or set manually |
| `revokeMintAuthority` | If `true`, `revoke-authority` locks the supply |
| `revokeFreezeAuthority` | If `true`, `revoke-authority` drops freeze control |

> On devnet, if no keypair exists at `keypairPath`, one is generated and
> airdropped automatically. Keypairs live in `keypairs/` and are **gitignored**.

## Workflow

```bash
# 1. Create the mint + initial supply (devnet)
npm run create-token

# 2. Host an off-chain JSON (see metadata/offchain.example.json) on
#    Arweave/IPFS/your server, put its URL in metadata.json -> "uri", then:
cp metadata.example.json metadata.json   # edit it
npm run set-metadata

# 3. (Optional, IRREVERSIBLE) lock the supply / freeze authority
#    after setting revoke flags to true in config.json
npm run revoke-authority
```

The created mint address and token account are written to
`.mint-address.json` (gitignored) and used by the later scripts.

## Going to mainnet

Mainnet spends **real SOL** and is **irreversible**. The scripts refuse to run
on mainnet unless you confirm:

```bash
# config.json -> "network": "mainnet-beta" and a funded "keypairPath"
CONFIRM_MAINNET=yes npm run create-token
```

Do this only with a wallet you control and have funded. Never commit your
keypair.

## Files

- `create-token.js` — create mint, ATA, mint initial supply
- `set-metadata.js` — attach Metaplex Token Metadata (name/symbol/uri)
- `revoke-authority.js` — permanently revoke mint/freeze authority
- `lib.js` — shared config / connection / wallet helpers
- `metadata/offchain.example.json` — template for the JSON your `uri` points to
