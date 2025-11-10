# Security Architecture Specialist

## Specialization
Security Architecture expert - Authentication, authorization, encryption, OWASP Top 10, compliance.

## When to Load
- Authentication/authorization design
- Security requirements
- Compliance needs (GDPR, HIPAA)
- Threat modeling
- Security audits
- Penetration testing preparation

## Expertise Areas

### 1. Authentication

#### JWT (JSON Web Tokens)

**Structure:**
```
Header.Payload.Signature
```

**Implementation:**
```typescript
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Use RS256 (asymmetric) for production
const privateKey = fs.readFileSync('private.key');
const publicKey = fs.readFileSync('public.key');

// Generate token
const accessToken = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role
  },
  privateKey,
  {
    algorithm: 'RS256',
    expiresIn: '15m',  // Short-lived
    issuer: 'api.example.com',
    audience: 'app.example.com'
  }
);

const refreshToken = jwt.sign(
  { userId: user.id },
  privateKey,
  {
    algorithm: 'RS256',
    expiresIn: '7d',
    issuer: 'api.example.com'
  }
);

// Verify token
const payload = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],
  issuer: 'api.example.com',
  audience: 'app.example.com'
});
```

**Best Practices:**
- ✅ Use RS256 (not HS256) in production
- ✅ Short expiry for access tokens (15min)
- ✅ Refresh tokens for renewal
- ✅ Store refresh tokens securely (httpOnly cookie)
- ❌ Don't store sensitive data in payload (it's readable!)
- ❌ Can't revoke JWTs (use short expiry)

#### Session-Based (Alternative)

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JS access
    sameSite: 'strict',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}));
```

**JWT vs Sessions:**
```
JWT:
✅ Stateless (horizontal scaling)
✅ Mobile-friendly
❌ Can't revoke
❌ Larger payload

Sessions:
✅ Can revoke immediately
✅ Smaller cookie
❌ Server state (Redis needed)
❌ CSRF protection needed
```

#### OAuth 2.0 / OpenID Connect

**For third-party login (Google, GitHub, etc):**
```typescript
// Using Passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://api.example.com/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      });
    }

    done(null, user);
  }
));
```

#### Multi-Factor Authentication (MFA)

**TOTP (Time-based One-Time Password):**
```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate secret
const secret = speakeasy.generateSecret({
  name: 'MyApp (user@example.com)'
});

// Generate QR code
const qrCode = await QRCode.toDataURL(secret.otpauth_url);

// Verify token
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userProvidedToken,
  window: 2  // Allow ±1 time step
});
```

### 2. Authorization

#### Role-Based Access Control (RBAC)

```typescript
// Roles
enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

// Permissions
const permissions = {
  admin: ['user:read', 'user:write', 'user:delete', 'post:*'],
  moderator: ['user:read', 'post:read', 'post:write', 'post:delete'],
  user: ['user:read', 'post:read', 'post:write:own']
};

// Middleware
const authorize = (permission: string) => {
  return (req, res, next) => {
    const userPermissions = permissions[req.user.role];

    if (!userPermissions.includes(permission) &&
        !userPermissions.includes(permission.split(':')[0] + ':*')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// Usage
app.delete('/users/:id',
  authenticate,
  authorize('user:delete'),
  deleteUser
);
```

#### Attribute-Based Access Control (ABAC)

```typescript
// More flexible: can access if owner OR admin
const canDelete = (req, res, next) => {
  const { id } = req.params;
  const resource = await Resource.findById(id);

  if (req.user.role === 'admin' || resource.userId === req.user.id) {
    return next();
  }

  res.status(403).json({ error: 'Forbidden' });
};
```

### 3. Password Security

#### Hashing (bcrypt)

```typescript
import bcrypt from 'bcrypt';

// Hash password (registration)
const SALT_ROUNDS = 12;  // 10-12 recommended
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

// Verify password (login)
const isValid = await bcrypt.compare(password, passwordHash);
```

**Best Practices:**
- ✅ Use bcrypt or argon2 (NOT md5, sha1, sha256)
- ✅ Salt rounds: 10-12 (higher = slower = more secure)
- ✅ Never store plain-text passwords
- ✅ Never log passwords
- ❌ Don't implement your own crypto

#### Password Policy

```typescript
const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'At least one uppercase')
  .regex(/[a-z]/, 'At least one lowercase')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character');
```

### 4. OWASP Top 10 (2021)

#### A01: Broken Access Control

```typescript
// ❌ VULNERABLE: No ownership check
app.delete('/posts/:id', async (req, res) => {
  await Post.delete(req.params.id);
  res.status(204).send();
});

// ✅ SECURE: Check ownership
app.delete('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Post.delete(req.params.id);
  res.status(204).send();
});
```

#### A02: Cryptographic Failures

```typescript
// ✅ Encrypt sensitive data at rest
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    authTag: authTag.toString('hex')
  };
}
```

#### A03: Injection

**SQL Injection:**
```typescript
// ❌ VULNERABLE
const email = req.body.email;
await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SECURE: Parameterized query
await db.query('SELECT * FROM users WHERE email = $1', [email]);

// ✅ SECURE: ORM
await prisma.user.findUnique({ where: { email } });
```

**NoSQL Injection:**
```typescript
// ❌ VULNERABLE
await User.find({ email: req.body.email });
// Attack: { email: { $ne: null } } returns all users

// ✅ SECURE: Validate input
const email = z.string().email().parse(req.body.email);
await User.find({ email });
```

**Command Injection:**
```typescript
// ❌ VULNERABLE
exec(`ping -c 1 ${req.body.host}`);

// ✅ SECURE: Validate and sanitize
const host = z.string().regex(/^[\w.-]+$/).parse(req.body.host);
exec(`ping -c 1 ${host}`);
```

#### A04: Insecure Design

- Threat modeling during design phase
- Principle of least privilege
- Defense in depth
- Secure defaults

#### A05: Security Misconfiguration

```typescript
// ✅ Security headers
import helmet from 'helmet';
app.use(helmet());

// ✅ CORS
import cors from 'cors';
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// ✅ Rate limiting
import rateLimit from 'express-rate-limit';
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ✅ Disable X-Powered-By
app.disable('x-powered-by');

// ❌ Don't expose stack traces in production
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
  });
}
```

#### A06: Vulnerable and Outdated Components

```bash
# Regular audits
npm audit
npm audit fix

# Use Snyk or similar
snyk test
snyk monitor
```

#### A07: Identification and Authentication Failures

- Implement MFA
- Secure password reset flow
- Rate limit authentication attempts
- Use secure session management
- Protect against credential stuffing

```typescript
// ✅ Rate limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts'
});

app.post('/auth/login', loginLimiter, login);
```

#### A08: Software and Data Integrity Failures

- Code signing
- Dependency verification
- CI/CD security
- Supply chain security

```yaml
# GitHub Actions: Pin versions
- uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab  # v3.5.2
```

#### A09: Security Logging and Monitoring Failures

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log security events
logger.info('User login', { userId: user.id, ip: req.ip });
logger.warn('Failed login attempt', { email, ip: req.ip });
logger.error('Unauthorized access attempt', { userId, resource, ip: req.ip });
```

#### A10: Server-Side Request Forgery (SSRF)

```typescript
// ❌ VULNERABLE: Unvalidated URL
const response = await fetch(req.body.url);

// ✅ SECURE: Whitelist allowed domains
const allowedDomains = ['api.example.com', 'cdn.example.com'];
const url = new URL(req.body.url);

if (!allowedDomains.includes(url.hostname)) {
  throw new Error('Invalid domain');
}

const response = await fetch(url.toString());
```

### 5. Cross-Site Scripting (XSS)

```typescript
// ✅ React escapes by default
<div>{userInput}</div>

// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Sanitize if needed
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],  // Remove unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

### 6. Cross-Site Request Forgery (CSRF)

```typescript
// ✅ CSRF tokens
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
  // Protected
});

// ✅ SameSite cookies
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### 7. API Security

```typescript
// ✅ API Key authentication
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Invalid API key' });
}

// ✅ Rate limiting per API key
const limiter = rateLimit({
  keyGenerator: (req) => req.headers['x-api-key'],
  windowMs: 60 * 1000,
  max: 60  // 60 requests per minute
});

// ✅ Input validation
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(2).max(100),
  age: z.number().int().min(0).max(150)
});

// ✅ Output sanitization (no sensitive data)
const userResponse = {
  id: user.id,
  email: user.email,
  name: user.name
  // Don't include: passwordHash, sessionToken, etc
};
```

### 8. Compliance

#### GDPR (General Data Protection Regulation)

**Requirements:**
- User consent for data collection
- Right to access data
- Right to deletion ("right to be forgotten")
- Data portability
- Privacy by design

```typescript
// Export user data
app.get('/api/users/:id/export', async (req, res) => {
  const user = await User.findById(req.params.id);
  const posts = await Post.findByUserId(req.params.id);
  const comments = await Comment.findByUserId(req.params.id);

  res.json({
    user,
    posts,
    comments
  });
});

// Delete user data
app.delete('/api/users/:id', async (req, res) => {
  await User.delete(req.params.id);
  await Post.deleteByUserId(req.params.id);
  await Comment.deleteByUserId(req.params.id);

  res.status(204).send();
});
```

#### HIPAA (Health Insurance Portability and Accountability Act)

**Requirements:**
- Encryption at rest and in transit
- Access controls
- Audit logs
- Business Associate Agreements (BAA)

### 9. Secrets Management

```bash
# ❌ DON'T commit secrets
.env

# ✅ DO provide template
.env.example

# ✅ Use secret managers
AWS Secrets Manager
Azure Key Vault
Google Secret Manager
HashiCorp Vault
```

```typescript
// ✅ Load from environment
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

// ✅ Validate on startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
```

### 10. Security Checklist

#### Authentication
- [ ] Passwords hashed with bcrypt (cost 12+)
- [ ] JWT using RS256 (not HS256)
- [ ] Short-lived access tokens (15min)
- [ ] Refresh tokens for renewal
- [ ] MFA available for sensitive operations
- [ ] Secure password reset flow
- [ ] Rate limit login attempts

#### Authorization
- [ ] RBAC or ABAC implemented
- [ ] Principle of least privilege
- [ ] Ownership checks on resources
- [ ] No insecure direct object references

#### Data Protection
- [ ] HTTPS only (redirect HTTP → HTTPS)
- [ ] Sensitive data encrypted at rest
- [ ] No secrets in code or logs
- [ ] PII handling compliant (GDPR, etc)

#### Input Validation
- [ ] All inputs validated (Zod, Joi)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection (tokens, SameSite cookies)

#### API Security
- [ ] Rate limiting (global + per-endpoint)
- [ ] API keys or OAuth for external access
- [ ] CORS configured (not wildcard)
- [ ] Security headers (helmet.js)

#### Monitoring
- [ ] Security events logged
- [ ] Failed auth attempts monitored
- [ ] Abnormal behavior alerting
- [ ] Regular security audits

#### Dependencies
- [ ] Regular npm audit
- [ ] Automated dependency updates (Dependabot)
- [ ] No known vulnerabilities

## Security Architecture Document Template

```markdown
# Security Architecture: [Feature]

## Threat Model
- **Threats:** Unauthorized access, data breach, XSS, CSRF
- **Assets:** User data, authentication tokens, PII
- **Mitigations:** [List specific mitigations]

## Authentication
- Method: JWT with RS256
- Token expiry: 15min (access), 7d (refresh)
- Storage: httpOnly cookies

## Authorization
- Model: RBAC
- Roles: admin, moderator, user
- Permissions: [List]

## Data Protection
- Encryption: AES-256-GCM (at rest), TLS 1.3 (in transit)
- PII fields: email, name (encrypted)
- Retention: 90 days

## Compliance
- GDPR: ✅ User consent, data export, deletion
- HIPAA: N/A

## Security Controls
- Rate limiting: 100 req/15min (general), 5 req/15min (auth)
- CSRF: ✅ Tokens + SameSite cookies
- XSS: ✅ CSP + sanitization
- SQL Injection: ✅ Parameterized queries

## Monitoring
- Failed login attempts → alert after 10 failures
- Unusual access patterns → flag for review
- All sensitive operations logged
```

## Key Metrics
- Failed auth rate: < 1%
- API key rotation: Every 90 days
- Vulnerability remediation: < 7 days (critical)
- Security audit: Quarterly
