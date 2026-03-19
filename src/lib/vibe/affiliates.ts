/**
 * Affiliate data layer for OpenClawfice.
 * 
 * Storage: ~/.openclaw/.status/affiliates.json
 * Simple JSON file — no database needed for Phase 1.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.env.HOME || '/tmp', '.openclaw', '.status');
const AFFILIATES_FILE = path.join(DATA_DIR, 'affiliates.json');

export interface Affiliate {
  id: string;
  refCode: string;
  name: string;
  email: string;
  twitter?: string;
  createdAt: number;
  status: 'active' | 'suspended';
}

export interface Referral {
  id: string;
  affiliateRef: string;
  visitorId: string;
  timestamp: number;
  page: string;
  converted: boolean;
  conversionDate?: number;
  plan?: string;
  revenue?: number;
}

export interface AffiliateData {
  affiliates: Affiliate[];
  referrals: Referral[];
}

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch { /* ignore on read-only fs */ }
}

export function readData(): AffiliateData {
  try {
    if (!fs.existsSync(AFFILIATES_FILE)) {
      return { affiliates: [], referrals: [] };
    }
    return JSON.parse(fs.readFileSync(AFFILIATES_FILE, 'utf-8'));
  } catch {
    return { affiliates: [], referrals: [] };
  }
}

export function writeData(data: AffiliateData): boolean {
  try {
    ensureDir();
    fs.writeFileSync(AFFILIATES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a URL-safe ref code from a name.
 * e.g., "Tyler Bot" → "tylerbot", "pixel_dev" → "pixel-dev"
 */
export function generateRefCode(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

  const data = readData();
  let code = base;
  let attempt = 0;

  // Ensure uniqueness
  while (data.affiliates.some(a => a.refCode === code)) {
    attempt++;
    code = `${base}-${attempt}`;
  }

  return code;
}

export function getAffiliateByRef(refCode: string): Affiliate | undefined {
  const data = readData();
  return data.affiliates.find(a => a.refCode === refCode && a.status === 'active');
}

export function getAffiliateByEmail(email: string): Affiliate | undefined {
  const data = readData();
  return data.affiliates.find(a => a.email.toLowerCase() === email.toLowerCase());
}

export function getReferralsForAffiliate(refCode: string): Referral[] {
  const data = readData();
  return data.referrals.filter(r => r.affiliateRef === refCode);
}

/**
 * Calculate affiliate earnings.
 * 30% commission on Pro subscriptions ($9/month).
 */
export function calculateEarnings(refCode: string): {
  totalClicks: number;
  conversions: number;
  conversionRate: number;
  totalEarnings: number;
  monthlyEarnings: number;
} {
  const referrals = getReferralsForAffiliate(refCode);
  const conversions = referrals.filter(r => r.converted);
  const totalRevenue = conversions.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const commission = totalRevenue * 0.30;

  // Monthly earnings = active converted users × $9 × 30%
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const recentConversions = conversions.filter(r => (r.conversionDate || r.timestamp) > thirtyDaysAgo);
  const monthlyEarnings = recentConversions.length * 9 * 0.30;

  return {
    totalClicks: referrals.length,
    conversions: conversions.length,
    conversionRate: referrals.length > 0 ? conversions.length / referrals.length : 0,
    totalEarnings: commission,
    monthlyEarnings,
  };
}
