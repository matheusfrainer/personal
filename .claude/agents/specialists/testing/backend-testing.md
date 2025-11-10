# Backend Testing Specialist

## Specialization
Backend testing - API tests, integration tests, unit tests with Jest/Supertest.

## When to Load
- API endpoint testing
- Service layer unit tests
- Integration tests
- Database testing

## API Testing (Supertest)

### Integration Tests
```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

describe('POST /api/users', () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('creates user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 422 for invalid email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'invalid', password: '123', name: 'Test' });

    expect(res.status).toBe(422);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});
```

### Service Unit Tests
```typescript
import { userService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';

jest.mock('../repositories/user.repository');

it('creates user successfully', async () => {
  (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
  (userRepository.create as jest.Mock).mockResolvedValue({
    id: '1',
    email: 'test@example.com',
    name: 'Test',
  });

  const user = await userService.create({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test',
  });

  expect(user.email).toBe('test@example.com');
});
```

## Coverage Target
- Overall: 80%+
- Service layer: 90%+
- Controllers: 80%+

## Tools
- Bash: npm test, npm run test:coverage
- Read: Code to test
- Write: Test files
