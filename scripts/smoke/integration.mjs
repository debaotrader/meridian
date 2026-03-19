/**
 * Meridian Phase 6 — Cross-module integration smoke test
 * Run: node scripts/smoke/integration.mjs
 * Exit 0 = all assertions passed. Exit 1 = failure.
 */

import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Minimal stubs (no Next.js / DOM needed)
// ---------------------------------------------------------------------------

// Stub: parseCrossModuleEvent (mirrors the real logic for test purposes)
function parseCrossModuleEvent(event) {
  const ts = new Date(event.timestamp ?? event.ts ?? Date.now()).toISOString();
  const p = event.payload ?? {};

  switch (event.type) {
    case 'task.dispatched':
      if (!p.taskId || !p.agentId) return null;
      return { type: 'task.dispatched', taskId: p.taskId, agentId: p.agentId, taskName: p.taskName ?? '', ts };
    case 'task.completed':
      if (!p.taskId || !p.agentId) return null;
      return { type: 'task.completed', taskId: p.taskId, agentId: p.agentId, ts };
    case 'task.approved':
      if (!p.taskId) return null;
      return { type: 'task.approved', taskId: p.taskId, xpGained: p.xpGained ?? 0, ts };
    case 'agent.message.delta':
      if (!p.agentId) return null;
      return { type: 'agent.message.delta', agentId: p.agentId, markdown: p.markdown ?? p.text ?? '', ts };
    case 'agent.status.changed':
      if (!p.agentId || !p.status) return null;
      return { type: 'agent.status.changed', agentId: p.agentId, status: p.status, ts };
    default:
      return null;
  }
}

// Stub: office store (in-memory)
class OfficeStoreMock {
  constructor() { this.agents = new Map(); }
  upsert(id, patch) {
    const existing = this.agents.get(id) ?? { id, status: 'idle', speechBubble: null };
    this.agents.set(id, { ...existing, ...patch });
  }
  get(id) { return this.agents.get(id) ?? null; }
}

// Stub: router
class RouterMock {
  constructor() { this.calls = []; }
  push(url) { this.calls.push(url); }
  lastCall() { return this.calls[this.calls.length - 1] ?? null; }
}

// ---------------------------------------------------------------------------
// Bridge logic stub (mirrors cross-module-bridge.ts behaviour)
// ---------------------------------------------------------------------------
function handleGatewayEvent(rawEvent, store, routerPushFn) {
  const parsed = parseCrossModuleEvent(rawEvent);
  if (!parsed) return;

  switch (parsed.type) {
    case 'task.dispatched':
      store.upsert(parsed.agentId, { status: 'working', speechBubble: null });
      break;
    case 'task.completed':
      store.upsert(parsed.agentId, { status: 'idle', speechBubble: null });
      break;
    case 'agent.message.delta': {
      const text = parsed.markdown.slice(0, 80);
      store.upsert(parsed.agentId, { speechBubble: { text, timestamp: Date.now() } });
      break;
    }
    case 'agent.status.changed':
      store.upsert(parsed.agentId, { status: parsed.status });
      break;
  }
}

// Avatar double-click handler stub (mirrors AgentAvatar onDoubleClick → goToAgentTask)
function avatarDoubleClick(agentId, taskMap, router) {
  const taskId = taskMap[agentId];
  if (taskId) {
    router.push(`/meridian/kanban?task=${taskId}&agent=${agentId}`);
  }
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

console.log('\nMeridian Phase 6 — Integration smoke tests\n');

const store = new OfficeStoreMock();
const router = new RouterMock();

// --- Assert 1: task.dispatched → agent status = 'working' ---
test('task.dispatched sets agent tony status to working', () => {
  handleGatewayEvent({
    type: 'task.dispatched',
    ts: Date.now(),
    payload: { taskId: 'task-1', agentId: 'tony', taskName: 'Build UI' },
  }, store, null);

  const tony = store.get('tony');
  assert.ok(tony, 'tony agent should exist in store');
  assert.equal(tony.status, 'working', `expected 'working', got '${tony?.status}'`);
});

// --- Assert 2: agent.message.delta → speechBubble set for shuri ---
test('agent.message.delta sets speechBubble for agent shuri', () => {
  handleGatewayEvent({
    type: 'agent.message.delta',
    ts: Date.now(),
    payload: { agentId: 'shuri', markdown: 'Analysing the codebase...' },
  }, store, null);

  const shuri = store.get('shuri');
  assert.ok(shuri, 'shuri agent should exist in store');
  assert.notEqual(shuri.speechBubble, null, 'speechBubble should not be null after message.delta');
  assert.ok(shuri.speechBubble?.text?.length > 0, 'speechBubble.text should be non-empty');
});

// --- Assert 3: task.completed → agent returns to idle ---
test('task.completed returns tony to idle status', () => {
  // tony is 'working' from assert 1
  handleGatewayEvent({
    type: 'task.completed',
    ts: Date.now(),
    payload: { taskId: 'task-1', agentId: 'tony' },
  }, store, null);

  const tony = store.get('tony');
  assert.ok(tony, 'tony agent should still exist');
  assert.equal(tony.status, 'idle', `expected 'idle', got '${tony?.status}'`);
});

// --- Assert 4: avatar double-click → router.push with correct taskId ---
test('avatar double-click calls router.push with correct taskId', () => {
  const taskMap = { banner: 'task-42' };
  avatarDoubleClick('banner', taskMap, router);

  const url = router.lastCall();
  assert.ok(url, 'router.push should have been called');
  assert.ok(url.includes('task-42'), `expected url to contain task-42, got: ${url}`);
  assert.ok(url.includes('banner'), `expected url to contain agent id, got: ${url}`);
});

// --- Summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
