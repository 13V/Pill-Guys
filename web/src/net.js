// NET — thin WebSocket client for the casual relay multiplayer (server/relay.mjs).
//
//   createNet({ url, room, level, skin, name, onWelcome, onJoin, onState, onFinish, onLeave })
//
// OFFLINE-SAFE BY DESIGN: if `url` is falsy (no ?mp= param) or the socket never
// opens, every method is a no-op and `connected` stays false — so the game runs
// exactly as single-player and the headless tests (which never pass ?mp=) are
// completely unaffected. The relay just forwards transforms; this client owns the
// local bean and renders peers via effects/remotePlayers.js.
//
// Local transforms are coalesced and flushed at SEND_HZ (we only ever keep the
// latest, so a slow frame can't back up the socket). Coordinates are rounded to
// 2 decimals to keep packets tiny.

const SEND_HZ = 15;
const SEND_DT = 1 / SEND_HZ;
const round = (n) => Math.round(n * 100) / 100;

export function createNet(opts = {}) {
  const {
    url, room = 'public', level = 1, skin = null, name = 'Bean',
    onWelcome, onJoin, onState, onFinish, onLeave,
  } = opts;

  let ws = null;
  let connected = false;
  let selfId = null;
  let pending = null;   // latest un-sent local state
  let sendAcc = 0;

  if (url && typeof WebSocket !== 'undefined') {
    try {
      ws = new WebSocket(url);
      ws.addEventListener('open', () => {
        connected = true;
        raw({ t: 'join', room, level, skin, name });
      });
      ws.addEventListener('message', (e) => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        switch (m.t) {
          case 'welcome': selfId = m.id; onWelcome && onWelcome(m); break;
          case 'join': onJoin && onJoin(m); break;
          case 'st': onState && onState(m); break;
          case 'fin': onFinish && onFinish(m); break;
          case 'leave': onLeave && onLeave(m); break;
          case 'full': console.warn('[net] room full'); break;
          default: break;
        }
      });
      ws.addEventListener('close', () => { connected = false; });
      ws.addEventListener('error', () => { connected = false; });
    } catch {
      ws = null;
    }
  }

  function raw(obj) { if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify(obj)); } catch { /* ignore */ } } }

  return {
    get connected() { return connected; },
    get id() { return selfId; },
    // Coalesce the latest local transform; flushed at SEND_HZ inside update().
    setState(p, ry, moving) {
      pending = { t: 'st', p: [round(p.x), round(p.y), round(p.z)], r: round(ry || 0), m: moving ? 1 : 0 };
    },
    sendFinish() { raw({ t: 'fin' }); },
    update(dt) {
      if (!connected) return;
      sendAcc += dt;
      if (sendAcc >= SEND_DT && pending) { sendAcc = 0; raw(pending); pending = null; }
    },
    dispose() { try { ws && ws.close(); } catch { /* ignore */ } ws = null; connected = false; },
  };
}
