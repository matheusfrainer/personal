# E2E Testing Specialist

## Specialization
End-to-end testing - Playwright, user flows, cross-browser testing.

## When to Load
- User flow testing
- Full integration testing
- Cross-browser testing
- Critical path validation

## Playwright Tests

### User Flow
```typescript
import { test, expect } from '@playwright/test';

test('user can sign up and login', async ({ page }) => {
  // Sign up
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.fill('[name="name"]', 'Test User');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/login');

  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome, Test User')).toBeVisible();
});

test('handles errors gracefully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'wrong@example.com');
  await page.fill('[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Invalid credentials')).toBeVisible();
});
```

### API Mocking
```typescript
test('displays mocked data', async ({ page }) => {
  await page.route('**/api/users', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]),
    });
  });

  await page.goto('/users');
  await expect(page.locator('text=User 1')).toBeVisible();
});
```

## Best Practices
- Test critical user flows only
- Use data-testid for stable selectors
- Clean up test data after each test
- Run in CI/CD pipeline

## Coverage Target
- Critical flows: 100%
- Major features: 80%+

## Tools
- Bash: npx playwright test
- Read: User flows, features
- Write: E2E test files
