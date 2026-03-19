import { NextResponse } from 'next/server';
import { spawn, execSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { sanitizeMessage, validateAgentId, validateAgentIdArray } from '@/lib/vibe/input-validation';
// Find openclaw binary: check PATH first, then common install locations
function findOpenclawBin(): string {
  try {
    return execSync('which openclaw', { encoding: 'utf-8' }).trim();
  } catch {}
  const candidates = [
    join(homedir(), '.local/node/bin/openclaw'),
    join(homedir(), '.local/bin/openclaw'),
    '/usr/local/bin/openclaw',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return 'openclaw'; // fallback to PATH
}

const OPENCLAW_BIN = findOpenclawBin();
const CHAT_FILE = join(homedir(), '.openclaw', '.status', 'chat.json');

/**
 * Send a message to an OpenClaw agent (fire and forget)
 */
function sendToAgentAsync(agentId: string, message: string): void {
  // Spawn agent and capture response for chat log
  const proc = spawn(OPENCLAW_BIN, ['agent', '--agent', agentId, '--message', message], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  let output = '';
  proc.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  const timeout = setTimeout(() => {
    try { proc.kill(); } catch {}
  }, 120_000);

  proc.on('close', () => {
    clearTimeout(timeout);
    const reply = output.trim();
    if (reply && reply !== 'NO_REPLY' && reply !== 'HEARTBEAT_OK' && reply.length > 0) {
      // Get agent display name from config
      let displayName = agentId;
      try {
        const cfg = JSON.parse(readFileSync(join(homedir(), '.openclaw', 'openclaw.json'), 'utf-8'));
        const agents = cfg.agents?.list || [];
        const agent = agents.find((a: any) => a.id === agentId);
        if (agent?.workspace) {
          const idPath = join(agent.workspace, 'IDENTITY.md');
          if (existsSync(idPath)) {
            const txt = readFileSync(idPath, 'utf-8');
            const nm = txt.match(/[-*]*\s*\*\*(?:Name|Nome):\*\*\s*(.+)/);
            if (nm) displayName = nm[1].trim();
          }
        }
      } catch {}
      addToChatLog(displayName, reply.slice(0, 500));
    }
  });

  proc.unref();
}

/**
 * Add message to water cooler chat log
 */
function addToChatLog(from: string, text: string): void {
  try {
    let chatLog: any[] = []; // justified: inherited from OpenClawfice merge
    if (existsSync(CHAT_FILE)) {
      chatLog = JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
    }
    
    chatLog.push({
      from,
      text,
      ts: Date.now()
    });
    
    // Keep last 50 messages
    if (chatLog.length > 50) {
      chatLog = chatLog.slice(-50);
    }
    
    writeFileSync(CHAT_FILE, JSON.stringify(chatLog, null, 2));
  } catch (err) {
    console.error('Failed to add to chat log:', err);
  }
}

/**
 * POST endpoint to send messages to agents
 */
export async function POST(request: Request) {

  try {
    const body = await request.json();
    const { agentId, message, broadcast, agentIds } = body;

    // Validate and sanitize message
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    let sanitizedMessage: string;
    try {
      sanitizedMessage = sanitizeMessage(message);
    } catch (err: any) { // justified: inherited from OpenClawfice merge
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    
    if (sanitizedMessage.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (broadcast && agentIds) {
      // Validate agent IDs array
      if (!validateAgentIdArray(agentIds)) {
        return NextResponse.json({ 
          error: 'Invalid agent IDs array (max 100 agents, alphanumeric IDs only)' 
        }, { status: 400 });
      }
      
      // Broadcast to multiple agents
      for (const id of agentIds) {
        sendToAgentAsync(id, sanitizedMessage);
      }
      
      // Note: chat log entry is handled by the /api/vibe/chat endpoint (user_message)
      // to avoid duplicate messages
      
      return NextResponse.json({ 
        success: true, 
        broadcast: true,
        agentCount: agentIds.length,
        message: sanitizedMessage 
      });
    }

    // Validate agent ID for DM
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required for DM' }, { status: 400 });
    }
    
    if (!validateAgentId(agentId)) {
      return NextResponse.json({ 
        error: 'Invalid agent ID (alphanumeric with hyphens/underscores only)' 
      }, { status: 400 });
    }

    // Send message to specific agent (fire and forget)
    sendToAgentAsync(agentId, sanitizedMessage);
    
    // Also add to water cooler for visibility
    addToChatLog('You', `→ ${agentId}: ${sanitizedMessage}`);

    return NextResponse.json({ 
      success: true, 
      agentId, 
      message: sanitizedMessage,
      sent: true 
    });

  } catch (err: any) { // justified: inherited from OpenClawfice merge
    return NextResponse.json({ 
      error: err.message || 'Failed to send message'
    }, { status: 500 });
  }
}
