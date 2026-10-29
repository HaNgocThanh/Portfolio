import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { randomUUID, webcrypto } from "node:crypto"
import { createClient } from "@libsql/client"
import { initializeDatabase, cleanupDatabase } from "../lib/chat-schema.mjs"
import { getTursoConfig, DatabaseConfigurationError } from "../lib/turso-client.mjs"

const localRequire = createRequire(import.meta.url)
const ts = localRequire("typescript")
const { NextRequest } = localRequire("next/server")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SID = "11111111-1111-4111-8111-111111111111"

function sourceLoader(env, overrides = {}) {
  const cache = new Map()
  function load(relative) {
    if (overrides[relative]) return overrides[relative]
    if (cache.has(relative)) return cache.get(relative).exports
    const loadedModule = { exports: {} }
    cache.set(relative, loadedModule)
    const code = ts.transpileModule(fs.readFileSync(path.join(root, relative), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true, allowJs: true },
    }).outputText
    const resolve = name => {
      if (overrides[name]) return overrides[name]
      if (name.startsWith("@/") || name.startsWith("./") || name.startsWith("../")) {
        let target = name.startsWith("@/") ? name.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(relative), name))
        if (!path.extname(target)) target += fs.existsSync(path.join(root, target + ".tsx")) ? ".tsx" : ".ts"
        return load(target)
      }
      return localRequire(name)
    }
    vm.runInNewContext(code, {
      module: loadedModule, exports: loadedModule.exports, require: resolve, process: { env }, console: { error() {} },
      URL, Response, Headers, ReadableStream, TextEncoder, TextDecoder, AbortSignal, AbortController, setTimeout, clearTimeout,
    }, { filename: relative })
    return loadedModule.exports
  }
  return load
}

async function fixture(extra = {}, mode = "success") {
  const client = createClient({ url: ":memory:" })
  await initializeDatabase(client)
  let calls = 0
  class AI {
    chat = { completions: { create: async () => {
      calls++
      if (mode === "provider-error") throw Error("PRIVATE provider details")
      return {
        controller: new AbortController(),
        async *[Symbol.asyncIterator]() {
          if (mode === "empty") return
          yield { choices: [{ delta: { content: mode === "oversize" ? "x".repeat(65537) : "Xin " } }] }
          if (mode === "interrupted") throw Error("PRIVATE provider details")
          yield { choices: [{ delta: { content: "chào" } }] }
        },
      }
    } } }
  }
  const env = { NODE_ENV: "production", NEXT_PUBLIC_BASE_URL: "http://localhost:3000", ROUTER_APIKEY: "fake", ROUTER_BASE_URL: "https://invalid.test/v1", ROUTER_MODEL: "fake-model", CRON_SECRET: "a".repeat(64), ...extra }
  const load = sourceLoader(env, {
    "lib/turso-client.mjs": { DatabaseConfigurationError, getTursoClient: () => client },
    openai: AI,
  })
  return { client, env, load, db: load("lib/db.ts"), calls: () => calls, close: () => client.close() }
}

function req({ method = "POST", body = JSON.stringify({ text: "hello" }), origin = "http://localhost:3000", session = SID, headers = {}, stream } = {}) {
  const all = { "content-type": "application/json", ...headers }
  if (origin !== null) all.origin = origin
  if (session !== null) all.cookie = "ryhar_chat_session=" + session
  const options = { method, headers: all }
  if (method === "POST") { options.body = stream || body; if (stream) options.duplex = "half" }
  return new NextRequest("http://localhost:3000/api/chat", options)
}
const pair = (sessionId = SID, id = randomUUID(), now = Date.now()) => [
  { id, sessionId, sender: "user", text: "question", createdAt: now },
  { id: randomUUID(), sessionId, sender: "bot", text: "answer", createdAt: now + 1 },
]
const count = async c => Number((await c.execute("SELECT count(*) n FROM messages")).rows[0].n)

test("remote configuration requires HTTPS/libsql and never accepts a file database", () => {
  assert.equal(getTursoConfig({ TURSO_DATABASE_URL: "libsql://example.turso.io", TURSO_AUTH_TOKEN: "secret" }).url, "https://example.turso.io/")
  for (const value of ["file:local.db", ":memory:", "http://example.test", "https://user:secret@example.test", "https://example.test?token=secret"]) {
    assert.throws(() => getTursoConfig({ TURSO_DATABASE_URL: value, TURSO_AUTH_TOKEN: "secret" }), DatabaseConfigurationError)
  }
  assert.throws(() => getTursoConfig({}), DatabaseConfigurationError)
})

test("schema setup is idempotent; successful message pair persists atomically", async () => {
  const h = await fixture()
  try {
    await initializeDatabase(h.client)
    const version = await h.db.getSessionVersion(SID)
    await h.db.saveConversation(...pair(), version)
    assert.equal(await count(h.client), 2)
    assert.equal((await h.db.getSessionMessages(SID)).length, 2)
  } finally { h.close() }
})

test("second insert failure rolls back the first insert", async () => {
  const h = await fixture()
  try {
    const version = await h.db.getSessionVersion(SID)
    const messages = pair()
    messages[1].id = messages[0].id
    await assert.rejects(h.db.saveConversation(...messages, version))
    assert.equal(await count(h.client), 0)
  } finally { h.close() }
})

test("clearing history invalidates responses already streaming in other tabs", async () => {
  const h = await fixture()
  try {
    const old = await h.db.getSessionVersion(SID)
    await h.db.clearSessionMessages(SID)
    await assert.rejects(h.db.saveConversation(...pair(), old), /cleared/)
    const next = await h.db.getSessionVersion(SID)
    assert.ok(next > old)
    await h.db.saveConversation(...pair(), next)
    assert.equal(await count(h.client), 2)
    await h.db.clearSessionMessages("other-session")
    assert.equal(await count(h.client), 2)
  } finally { h.close() }
})

test("rate limits persist across store instances, deny atomically and reset exactly", async () => {
  const h = await fixture()
  try {
    const quotas = [{ key: "global", max: 3 }, { key: "session", max: 1 }]
    assert.equal((await h.db.consumeRateLimits(quotas, 1000)).allowed, true)
    const reloaded = h.db.createChatStore(h.client)
    const denied = await reloaded.consumeRateLimits(quotas, 1001)
    assert.equal(denied.allowed, false); assert.equal(denied.retryAfter, 60)
    assert.equal(Number((await h.client.execute("SELECT count FROM chat_rate_limits WHERE key='global'")).rows[0].count), 1)
    assert.equal((await h.db.consumeRateLimits(quotas, 61000)).allowed, true)
  } finally { h.close() }
})

test("expired history is invisible before cleanup; daily cleanup removes rows", async () => {
  const h = await fixture({ CHAT_RETENTION_DAYS: "1" })
  try {
    const version = await h.db.getSessionVersion(SID)
    await h.db.saveConversation(...pair(SID, randomUUID(), Date.now() - 86400010), version)
    assert.equal((await h.db.getSessionMessages(SID)).length, 0)
    assert.equal(await count(h.client), 2)
    const deleted = await h.db.cleanupExpiredData()
    assert.equal(deleted.messages, 2); assert.equal(await count(h.client), 0)
  } finally { h.close() }
})

test("history is limited to the newest 100 records and AI context to 10 x 4000 characters", async () => {
  const h = await fixture()
  try {
    const now = Date.now()
    await h.client.batch(Array.from({ length: 105 }, (_, i) => ({
      sql: "INSERT INTO messages VALUES (?,?,?,?,?)", args: ["m" + i, SID, "user", "x".repeat(5000), now - 1000 + i],
    })), "write")
    const rows = await h.db.getSessionMessages(SID)
    assert.equal(rows.length, 100); assert.equal(rows[0].id, "m5"); assert.equal(rows.at(-1).id, "m104")
    const context = await h.db.getRecentHistory(SID, 1000)
    assert.equal(context.length, 10); assert.equal(context[0].content.length, 4000)
  } finally { h.close() }
})

const invalid = [
  ["null", "null", 400], ["array", "[]", 400], ["number", "42", 400], ["missing text", "{}", 400],
  ["wrong type", '{"text":2}', 400], ["extra history", '{"text":"hi","history":[]}', 400],
  ["blank", '{"text":" "}', 400], ["too long", JSON.stringify({ text: "a".repeat(1001) }), 400],
  ["invalid JSON", '{"text":', 400], ["too large", JSON.stringify({ text: " ".repeat(17000) }), 413],
]
for (const [name, body, status] of invalid) test("rejects " + name + " without calling AI", async () => {
  const h = await fixture()
  try { assert.equal((await h.load("app/api/chat/route.ts").POST(req({ body }))).status, status); assert.equal(h.calls(), 0) }
  finally { h.close() }
})

test("body streaming limit works with missing or misleading Content-Length", async () => {
  const h = await fixture()
  try {
    for (const headers of [{}, { "content-length": "1" }]) {
      const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(9000)); c.enqueue(new Uint8Array(9000)); c.close() } })
      assert.equal((await h.load("app/api/chat/route.ts").POST(req({ headers, stream }))).status, 413)
    }
    assert.equal((await h.load("app/api/chat/route.ts").POST(req({ headers: { "content-type": "text/plain" } }))).status, 415)
  } finally { h.close() }
})

test("origin checks protect all methods; Vercel preview origin is explicitly allowed", async () => {
  const h = await fixture({ VERCEL: "1", VERCEL_URL: "preview-example.vercel.app" })
  try {
    const messages = h.load("app/api/chat/messages/route.ts")
    for (const origin of ["https://evil.test", "https://localhost:3000", "http://localhost:3001", "null"]) {
      assert.equal((await h.load("app/api/chat/route.ts").POST(req({ origin }))).status, 403)
      assert.equal((await messages.GET(req({ method: "GET", origin }))).status, 403)
      assert.equal((await messages.DELETE(req({ method: "DELETE", origin }))).status, 403)
    }
    assert.equal((await messages.GET(req({ method: "GET", origin: "https://preview-example.vercel.app" }))).status, 200)
    assert.equal((await messages.GET(req({ method: "GET", origin: "https://fake-preview.vercel.app" }))).status, 403)
  } finally { h.close() }
})

test("forged IP headers are ignored off Vercel; quotas survive cookie rotation", async () => {
  const h = await fixture()
  try {
    const guard = h.load("lib/chat-security.ts").guardChatRequest
    for (let i = 0; i < 10; i++) assert.equal(await guard(req({ session: randomUUID(), headers: { "x-real-ip": "10.0.0." + i } }), "send"), null)
    const response = await guard(req({ session: randomUUID(), headers: { "x-real-ip": "8.8.8.8" } }), "send")
    assert.equal(response.status, 429); assert.ok(Number(response.headers.get("Retry-After")) >= 1)
  } finally { h.close() }
})

test("cookie renewal is Secure/HttpOnly and malformed session cannot delete data", async () => {
  const h = await fixture()
  try {
    const routes = h.load("app/api/chat/messages/route.ts")
    const response = await routes.GET(req({ method: "GET", session: "bad-cookie" }))
    assert.equal(response.status, 200)
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i); assert.match(response.headers.get("set-cookie"), /Secure/i)
    assert.equal(response.headers.get("Cache-Control"), "no-store")
    assert.equal((await routes.DELETE(req({ method: "DELETE", session: "bad-cookie" }))).status, 400)
  } finally { h.close() }
})

for (const mode of ["success", "provider-error", "empty", "interrupted", "oversize"]) test("AI streaming policy: " + mode, async () => {
  const h = await fixture({}, mode)
  try {
    const response = await h.load("app/api/chat/route.ts").POST(req())
    if (mode === "provider-error") { assert.equal(response.status, 500); assert.doesNotMatch(await response.text(), /PRIVATE/) }
    else if (mode === "success") { assert.equal(await response.text(), "Xin chào"); assert.equal(await count(h.client), 2) }
    else { await assert.rejects(response.text()); assert.equal(await count(h.client), 0) }
  } finally { h.close() }
})

test("cron fails closed before touching DB and accepts only the configured secret", async () => {
  const h = await fixture()
  try {
    const route = h.load("app/api/cron/cleanup/route.ts")
    assert.equal((await route.GET(req({ method: "GET" }))).status, 401)
    assert.equal((await route.GET(req({ method: "GET", headers: { authorization: "Bearer incorrect" } }))).status, 401)
    const response = await route.GET(req({ method: "GET", headers: { authorization: "Bearer " + h.env.CRON_SECRET } }))
    assert.equal(response.status, 200)
    h.env.CRON_SECRET = ""
    assert.equal((await route.GET(req({ method: "GET" }))).status, 503)
  } finally { h.close() }
})

test("cleanup maintenance supports existing schema without displaying user messages", async () => {
  const h = await fixture()
  try {
    await h.client.execute({ sql: "INSERT INTO messages VALUES (?,?,?,?,?)", args: ["expired", SID, "user", "private message", Date.now() - 86400010] })
    assert.equal((await cleanupDatabase(h.client, 1)).messages, 1)
  } finally { h.close() }
})


function loadFrontend(file, overrides = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root,file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(code, {
    module: loadedModule, exports: loadedModule.exports,
    require: name => name in overrides ? overrides[name] : localRequire(name),
    console: { error() {} }, Response, Headers, ReadableStream, TextEncoder, TextDecoder, AbortController,
    crypto: webcrypto, setTimeout, clearTimeout, ...globals,
  }, { filename: file });
  return loadedModule.exports;
}

const tick = () => new Promise(r => setImmediate(r));
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };
function frontend(fetch) {
  let cursor = 0;
  const slots = [], effects = [];
  const react = {
    useState(initial) { const i=cursor++; if(!(i in slots)) slots[i]=typeof initial==="function"?initial():initial; return [slots[i],value=>slots[i]=typeof value==="function"?value(slots[i]):value]; },
    useRef(initial) { const i=cursor++; return slots[i] ||= {current:initial}; },
    useEffect(fn) { const i=cursor++; if(!(i in slots)) {slots[i]=true;effects.push(fn);} },
  };
  const hook=loadFrontend("hooks/useChat.ts",{react,"@/content/profile":{chatWelcome:"welcome"}},{fetch}).useChat;
  const current=()=>{cursor=0;return hook()};
  const input=()=>({props:{value:current().chatInput,disabled:current().isChatBusy,onChange:e=>current().setChatInput(e.target.value)}});
  const send=()=>current().handleSendChat({preventDefault(){}});
  const clear=()=>current().handleClearChat();
  current();
  return {current,input,send,clear,effects,alert:()=>current().chatError||undefined};
}
function history() { return Response.json({ success: true, messages: [] }); }
test('UI waits for history; blocks duplicate sends and clear until stream ends', async () => {
  const gate = deferred(); let posts = 0, deletes = 0, stream;
  const h = frontend(async (url, init) => {
    if (url.endsWith('/messages') && init.method !== 'DELETE') return gate.promise;
    if (init.method === 'DELETE') { deletes++; return Response.json({ success: true }); }
    posts++; assert.deepEqual(JSON.parse(init.body), { text: 'hello' });
    return new Response(new ReadableStream({ start(c) { stream = c; } }));
  });
  h.effects.forEach(fn => fn());
  h.input().props.onChange({ target: { value: 'hello' } });
  await h.send(); assert.equal(posts, 0); assert.equal(h.input().props.disabled, true);
  gate.resolve(history()); await tick(); assert.equal(h.input().props.disabled, false);
  const sending = h.send(); await tick(); assert.equal(h.input().props.disabled, true);
  h.input().props.onChange({ target: { value: 'second' } });
  await h.send(); await h.clear(); assert.equal(posts, 1); assert.equal(deletes, 0);
  const bytes = new TextEncoder().encode('Tiếng Việt');
  stream.enqueue(bytes.slice(0,3)); await tick(); assert.equal(h.input().props.disabled, true);
  stream.enqueue(bytes.slice(3)); stream.close(); await sending;
  assert.equal(h.input().props.disabled, false);
  assert.equal(h.current().chatMessages.at(-1).text, 'Tiếng Việt');
});
test('UI shows API error, restores question and unlocks after HTTP failure', async () => {
  const h = frontend(async (url) => url.endsWith('/messages') ? history() : Response.json({ message: 'Konfigurasi API AI tidak ditemukan.' }, { status: 500 }));
  h.effects.forEach(fn => fn()); await tick();
  h.input().props.onChange({ target: { value: 'retry me' } }); await h.send();
  assert.equal(h.alert(), 'Konfigurasi API AI tidak ditemukan.'); assert.equal(h.input().props.value, 'retry me'); assert.equal(h.input().props.disabled, false);
});
test('failed DELETE keeps history and successful DELETE resets it', async () => {
  let succeeds = false;
  const h = frontend(async (url, init) => init.method === 'DELETE' ? Response.json({ success: succeeds, message: 'delete failed' }, { status: succeeds ? 200 : 500 }) : Response.json({ success: true, messages: [{ id: 'old', sender: 'user', text: 'keep me', timestamp: new Date().toISOString() }] }));
  h.effects.forEach(fn => fn()); await tick();
  await h.clear(); assert.equal(h.current().chatMessages[0].id, 'old'); assert.equal(h.alert(), 'delete failed');
  succeeds = true; await h.clear(); assert.equal(h.current().chatMessages[0].id, 'welcome-msg'); assert.equal(h.alert(), undefined);
});
test('interrupted stream keeps partial output, restores input and shows warning', async () => {
  let stream;
  const h = frontend(async url => url.endsWith('/messages') ? history() : new Response(new ReadableStream({ start(c) { stream = c; } })));
  h.effects.forEach(fn => fn()); await tick(); h.input().props.onChange({ target: { value: 'hello' } });
  const sending = h.send(); await tick(); stream.enqueue(new TextEncoder().encode('partial')); await tick(); stream.error(Error('network interrupted')); await sending;
  assert.equal(h.current().chatMessages.at(-1).text, 'partial'); assert.match(h.alert(), /belum lengkap/); assert.equal(h.input().props.value, 'hello'); assert.equal(h.input().props.disabled, false);
});
test('empty stream leaves no blank bot bubble', async () => {
  const h = frontend(async url => url.endsWith('/messages') ? history() : new Response(''));
  h.effects.forEach(fn => fn()); await tick(); h.input().props.onChange({ target: { value: 'hello' } }); await h.send();
  assert.match(h.alert(), /kosong/); assert.equal(h.current().chatMessages.filter(m => m.sender === 'bot' && !m.text.trim()).length, 0);
});
test('history load failure is visible and releases the UI', async () => {
  const h = frontend(async () => new Response('unavailable', { status: 503 }));
  h.effects.forEach(fn => fn()); await tick();
  assert.match(h.alert(), /riwayat/); assert.equal(h.input().props.disabled, false);
});
test('clear stays locked until DELETE confirms success', async () => {
  const gate = deferred(); let calls = 0;
  const h = frontend(async (url, init) => {
    if (init.method === 'DELETE') { calls++; return gate.promise; }
    return history();
  });
  h.effects.forEach(fn => fn()); await tick();
  const clearing = h.clear(); await tick();
  assert.equal(h.input().props.disabled, true); await h.clear(); assert.equal(calls, 1);
  gate.resolve(Response.json({ success: true })); await clearing; assert.equal(h.input().props.disabled, false);
});

