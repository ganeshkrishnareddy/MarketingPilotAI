/**
 * Shared in-memory store for active voice calls.
 * Keyed by Vobiz CallUUID; entries live only while the call is active.
 * Reply audio keys: `${callUuid}` (main reply), `${callUuid}:retry`, `${callUuid}:goodbye`.
 */

export type CallState = {
  history: { role: "user" | "assistant"; content: string }[];
  lang: string;
  retries: number;
  lastUsed: number;
};

const calls = new Map<string, CallState>();
const replyAudio = new Map<string, Buffer>();

export function getCall(uuid: string): CallState | undefined {
  return calls.get(uuid);
}

export function setCall(uuid: string, state: CallState) {
  calls.set(uuid, state);
}

export function deleteCall(uuid: string) {
  calls.delete(uuid);
  replyAudio.delete(uuid);
  replyAudio.delete(`${uuid}:retry`);
  replyAudio.delete(`${uuid}:goodbye`);
}

export function storeReply(key: string, wav8k: Buffer) {
  replyAudio.set(key, wav8k);
}

export function getReply(key: string): Buffer | undefined {
  return replyAudio.get(key);
}

/** Drop state for calls untouched in the last 30 minutes. */
export function cleanupStale() {
  const now = Date.now();
  for (const [uuid, st] of calls) {
    if (now - st.lastUsed > 30 * 60 * 1000) deleteCall(uuid);
  }
}
