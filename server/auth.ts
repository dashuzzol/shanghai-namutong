import crypto from 'crypto';

interface SessionInfo {
  username: string;
  role: string;
  createdAt: number;
}

// Tokens are signed (HMAC), so admin sessions survive server restarts,
// e.g. when a free host puts the server to sleep. Logged-out tokens are
// remembered in memory until they expire.
const revokedTokens = new Map<string, number>();

// 24 hour session lifetime in ms
const SESSION_TTL = 24 * 60 * 60 * 1000;

function signingKey(): Buffer {
  const secret =
    process.env.SESSION_SECRET ||
    `${process.env.ADMIN_USERNAME || 'admin'}:${process.env.ADMIN_PASSWORD || 'admin123'}:shanghai-namutong`;
  return crypto.createHash('sha256').update(secret).digest();
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', signingKey()).update(payload).digest('base64url');
}

function decodeToken(cleanToken: string): SessionInfo | null {
  if (!cleanToken.startsWith('cd_adm_')) return null;
  const [payload, signature] = cleanToken.slice(7).split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (typeof data.u !== 'string' || typeof data.t !== 'number') return null;
    return { username: data.u, role: 'admin', createdAt: data.t };
  } catch {
    return null;
  }
}

export function validateAdminCredentials(usernameInput?: string, passwordInput?: string): boolean {
  if (!usernameInput || !passwordInput) return false;

  const expectedUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const providedUser = usernameInput.trim().toLowerCase();
  const providedPass = passwordInput.trim();

  // Allow login with either the admin username OR company admin email
  const isUsernameMatch =
    providedUser === expectedUsername ||
    providedUser === 'admin@shanghainamutong.com' ||
    providedUser === 'info@shanghainamutong.com' ||
    providedUser === 'admin@chinadirectbd.com' ||
    (providedUser.includes('@') && providedUser.split('@')[0] === expectedUsername);

  // Secure comparison
  if (!isUsernameMatch) return false;

  // Constant-time comparison to prevent timing attacks
  const expectedPassBuffer = Buffer.from(expectedPassword);
  const providedPassBuffer = Buffer.from(providedPass);

  if (expectedPassBuffer.length !== providedPassBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedPassBuffer, providedPassBuffer);
}

export function createAdminSession(username: string): { token: string; user: { username: string; role: string } } {
  // Purge expired revocations
  const now = Date.now();
  for (const [token, expiresAt] of revokedTokens.entries()) {
    if (now > expiresAt) revokedTokens.delete(token);
  }

  const user = {
    username: username.trim(),
    role: 'admin',
  };

  const payload = Buffer.from(
    JSON.stringify({ u: user.username, t: now, n: crypto.randomBytes(8).toString('hex') })
  ).toString('base64url');
  const token = `cd_adm_${payload}.${sign(payload)}`;

  return { token, user };
}

export function verifyAdminToken(token?: string): { valid: boolean; user?: { username: string; role: string } } {
  if (!token) return { valid: false };

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const session = decodeToken(cleanToken);

  if (!session || revokedTokens.has(cleanToken)) {
    return { valid: false };
  }

  const now = Date.now();
  if (now - session.createdAt > SESSION_TTL || session.createdAt > now + 60_000) {
    return { valid: false };
  }

  return {
    valid: true,
    user: {
      username: session.username,
      role: session.role,
    },
  };
}

export function revokeAdminToken(token?: string): boolean {
  if (!token) return false;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const session = decodeToken(cleanToken);
  if (!session) return false;
  revokedTokens.set(cleanToken, session.createdAt + SESSION_TTL);
  return true;
}
