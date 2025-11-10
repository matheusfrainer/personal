# Backend Developer Specialist

## Specialization
Backend Developer expert - Node.js, Express, TypeScript, API implementation, validation, security.

## When to Load
- API endpoint implementation
- Business logic
- Server-side operations
- Middleware creation
- Service layer development

## Indicators
- File extensions: `.ts`, `.js` (in backend context)
- Paths: `routes/`, `controllers/`, `services/`, `middleware/`, `api/`
- Keywords: "API", "endpoint", "route", "controller", "service"

## Expertise

### API Implementation

#### RESTful Endpoint Structure
```typescript
// routes/users.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();

router.get('/',
  authenticate,
  userController.listUsers
);

router.get('/:id',
  authenticate,
  userController.getUser
);

router.post('/',
  validate(createUserSchema),
  userController.createUser
);

router.patch('/:id',
  authenticate,
  validate(updateUserSchema),
  userController.updateUser
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  userController.deleteUser
);

export default router;
```

#### Controller Layer (Thin)
```typescript
// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { CreateUserInput, UpdateUserInput } from '../types/user.types';

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.list({
      page: Number(page),
      limit: Number(limit),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

#### Service Layer (Business Logic)
```typescript
// services/user.service.ts
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput, User } from '../types/user.types';
import { ConflictError, NotFoundError } from '../utils/errors';

const SALT_ROUNDS = 12;

export const list = async (params: { page: number; limit: number }) => {
  const { page, limit } = params;
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    userRepository.findMany({ limit, offset }),
    userRepository.count(),
  ]);

  return {
    data: users.map(sanitizeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getById = async (id: string): Promise<User | null> => {
  const user = await userRepository.findById(id);
  return user ? sanitizeUser(user) : null;
};

export const create = async (data: CreateUserInput): Promise<User> => {
  // Check if email exists
  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw new ConflictError('Email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await userRepository.create({
    email: data.email,
    name: data.name,
    passwordHash,
  });

  // Send welcome email (async, don't wait)
  emailService.sendWelcome(user).catch(logger.error);

  return sanitizeUser(user);
};

export const update = async (
  id: string,
  data: UpdateUserInput
): Promise<User> => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // If updating email, check uniqueness
  if (data.email && data.email !== user.email) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }
  }

  const updated = await userRepository.update(id, data);
  return sanitizeUser(updated);
};

export const remove = async (id: string): Promise<void> => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await userRepository.delete(id);
};

// Remove sensitive fields
function sanitizeUser(user: any): User {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}
```

### Validation (Zod)

```typescript
// validators/user.validator.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email').max(255),
    password: z.string().min(8, 'At least 8 characters').max(128),
    name: z.string().min(2).max(100),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email().max(255).optional(),
    name: z.string().min(2).max(100).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

// Middleware
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
```

### Error Handling

#### Custom Errors
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}
```

#### Error Middleware
```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Operational errors (safe to expose)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Programming errors (don't leak details)
  res.status(500).json({
    error: 'Internal server error',
  });
};
```

### Authentication & Authorization

#### JWT Middleware
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Resource ownership check
export const authorizeOwnership = (resourceField = 'userId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get resource
      const resource = await getResource(req.params.id);

      if (!resource) {
        return next(new NotFoundError('Resource not found'));
      }

      // Check ownership or admin
      if (
        resource[resourceField] !== req.user?.userId &&
        req.user?.role !== 'admin'
      ) {
        return next(new ForbiddenError('Not authorized to access this resource'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
```

### Database Operations (Prisma)

#### Repository Pattern
```typescript
// repositories/user.repository.ts
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const userRepository = {
  findMany: async (params: { limit: number; offset: number }) => {
    return prisma.user.findMany({
      take: params.limit,
      skip: params.offset,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create: async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  },

  update: async (id: string, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    // Soft delete
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  count: async () => {
    return prisma.user.count({
      where: { deletedAt: null },
    });
  },
};
```

### Async Patterns

#### Promise.all (Parallel)
```typescript
// Good: Run independent queries in parallel
const [user, posts, comments] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.post.findMany({ where: { userId: id } }),
  prisma.comment.findMany({ where: { userId: id } }),
]);
```

#### Sequential (When Order Matters)
```typescript
// Create user first, then send email
const user = await prisma.user.create({ data });
await emailService.sendWelcome(user);
```

#### Fire and Forget (Non-Critical)
```typescript
// Don't wait for email to complete
emailService.sendWelcome(user).catch(logger.error);
```

### Security

#### Input Sanitization
```typescript
import sanitizeHtml from 'sanitize-html';

export const sanitizeInput = (input: string): string => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

// Use in service
const user = await userService.create({
  email: data.email,
  name: sanitizeInput(data.name),
});
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// General API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP',
});

// Auth endpoints (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// Apply
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### Testing

#### Integration Tests (Supertest)
```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

describe('POST /api/users', () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('should return 422 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test',
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should return 409 for duplicate email', async () => {
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Existing',
      },
    });

    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

    expect(response.status).toBe(409);
  });

  it('should hash password', async () => {
    await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    expect(user?.passwordHash).toBeDefined();
    expect(user?.passwordHash).not.toBe('password123');
  });
});
```

#### Unit Tests (Service Layer)
```typescript
import { userService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';
import { ConflictError } from '../utils/errors';

jest.mock('../repositories/user.repository');

describe('userService.create', () => {
  it('should create user successfully', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (userRepository.create as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test',
      passwordHash: 'hash',
    });

    const user = await userService.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test',
    });

    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBeUndefined(); // Sanitized
  });

  it('should throw ConflictError for duplicate email', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });

    await expect(
      userService.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      })
    ).rejects.toThrow(ConflictError);
  });
});
```

## Implementation Workflow

```markdown
1. READ REQUIREMENTS
   - Architecture document
   - API design specs
   - Database schema
   - Security requirements

2. CREATE ROUTE
   - Define endpoints
   - Add middleware (auth, validation)
   - Wire to controller

3. IMPLEMENT CONTROLLER
   - Thin layer
   - Extract params
   - Call service
   - Handle response

4. IMPLEMENT SERVICE
   - Business logic
   - Validation
   - Database operations via repository
   - Error handling

5. WRITE TESTS
   - Integration tests (API endpoints)
   - Unit tests (service logic)
   - Edge cases

6. VALIDATE
   - Run tests: npm test
   - Run linter: npm run lint
   - Check coverage: npm run test:coverage
```

## Code Quality Checklist

- [ ] Input validation (Zod)
- [ ] Error handling (try/catch + custom errors)
- [ ] Authentication/authorization where needed
- [ ] No secrets hardcoded
- [ ] SQL injection prevention (parameterized queries/ORM)
- [ ] Rate limiting on public endpoints
- [ ] Passwords hashed (bcrypt)
- [ ] Sensitive data not logged
- [ ] Sanitize output (no passwordHash, etc)
- [ ] Tests written (integration + unit)
- [ ] Async operations handled properly
- [ ] No blocking operations

## Anti-Patterns to Avoid

❌ **Business logic in controllers**
❌ **No error handling**
❌ **Synchronous blocking operations**
❌ **No input validation**
❌ **Exposing internal errors to client**
❌ **No pagination on list endpoints**
❌ **Missing authentication on protected routes**

## Tools to Use

- **Read** - Existing code, architecture, schemas
- **Write** - New files
- **Edit** - Modify existing code
- **Bash** - npm test, npm run lint, docker, curl (test endpoints)
- **Grep** - Find patterns, similar implementations

## Key Metrics
- Response time: < 200ms (p95)
- Test coverage: > 80%
- Error rate: < 1%
- Uptime: > 99.9%
