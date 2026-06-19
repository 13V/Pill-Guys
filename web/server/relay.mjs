// RELAY — a tiny authoritative-less WebSocket relay for casual party multiplayer.
//
//   node server/relay.mjs        (PORT=8787, CAP=20 players/room by default)
//
// This is a RELAY, not a simulator: every client runs its own bean locally (the
// same kinematic physics as single-player) and broadcasts its transform a few
// times a second. The relay just forwards those transforms to everyone else in
// the same room and hands each joiner a spawn SLOT so the pack starts spread out.
// That keeps the server trivial + stateless-ish and is plenty for a Fall-Guys
// style fun run (no anti-cheat — by design).
//
// Rooms are keyed by "<room>#<level>" so players only meet others on the same
// course. Protocol (JSON text frames) — see src/net.js for the client half:
//   client -> { t:'join', room, level, skin, name }
//             { t:'st', p:[x,y,z], r:ry, m:moving }
//             { t:'fin' }
//   server -> { t:'welcome', id, slot, cap, peers:[{id,slot,skin,name,p,r}] }
//             { t:'join', id, slot, skin, name, p, r }
//             { t:'st', id, p, r, m } | { t:'fin', id } | { t:'leave', id } | { t:'full' }
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || process.env.RELAY_PORT || 8787);
const CAP = Number(process.env.CAP || 20); // max players per room

const rooms = new Map(); // key -> { members: Map<id, member> }
let nextId = 1;

function roomFor(key) {
  let r = rooms.get(key);
  if (!r) { r = { members: new Map() }; rooms.set(key, r); }
  return r;
}
// Lowest free slot index in the room, so spawn slots stay packed [0..n).
function freeSlot(room) {
  const used = new Set([...room.members.values()].map((m) => m.slot));
  let s = 0; while (used.has(s)) s++; return s;
}
function send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch { /* socket gone */ } }
function broadcast(room, obj, exceptId) {
  for (const m of room.members.values()) if (m.id !== exceptId) send(m.ws, obj);
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  let id = null;
  let roomKey = null;

  ws.on('message', (buf) => {
    let msg;
    try { msg = JSON.parse(buf.toString()); } catch { return; }

    if (msg.t === 'join') {
      if (id != null) return; // already joined
      roomKey = `${String(msg.room || 'public').slice(0, 32)}#${parseInt(msg.level, 10) || 1}`;
      const room = roomFor(roomKey);
      if (room.members.size >= CAP) { send(ws, { t: 'full' }); try { ws.close(); } catch {} return; }
      id = nextId++;
      const me = {
        id, ws, slot: freeSlot(room),
        skin: msg.skin || null,
        name: String(msg.name || 'Bean').slice(0, 16),
        p: [0, 0, 0], r: 0,
      };
      room.members.set(id, me);
      send(ws, {
        t: 'welcome', id, slot: me.slot, cap: CAP,
        peers: [...room.members.values()].filter((m) => m.id !== id)
          .map((m) => ({ id: m.id, slot: m.slot, skin: m.skin, name: m.name, p: m.p, r: m.r })),
      });
      broadcast(room, { t: 'join', id, slot: me.slot, skin: me.skin, name: me.name, p: me.p, r: me.r }, id);
      console.log(`[relay] +${id} -> ${roomKey} (${room.members.size}/${CAP})`);
      return;
    }

    if (id == null) return; // ignore anything before join
    const room = rooms.get(roomKey);
    if (!room) return;
    const me = room.members.get(id);
    if (!me) return;

    if (msg.t === 'st') {
      if (Array.isArray(msg.p)) { me.p = msg.p; me.r = msg.r || 0; }
      broadcast(room, { t: 'st', id, p: msg.p, r: msg.r || 0, m: msg.m ? 1 : 0 }, id);
    } else if (msg.t === 'fin') {
      broadcast(room, { t: 'fin', id }, id);
    }
  });

  ws.on('close', () => {
    if (id == null || !roomKey) return;
    const room = rooms.get(roomKey);
    if (!room) return;
    room.members.delete(id);
    broadcast(room, { t: 'leave', id });
    console.log(`[relay] -${id} <- ${roomKey} (${room.members.size}/${CAP})`);
    if (room.members.size === 0) rooms.delete(roomKey);
  });

  ws.on('error', () => { /* let 'close' clean up */ });
});

console.log(`[relay] listening ws://localhost:${PORT}  (cap ${CAP}/room)`);
