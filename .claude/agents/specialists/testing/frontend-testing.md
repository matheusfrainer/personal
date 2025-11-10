# Frontend Testing Specialist

## Specialization
Frontend testing - Jest, React Testing Library, component tests, accessibility testing.

## When to Load
- Component testing
- UI interaction tests
- Frontend unit tests
- Accessibility validation

## Testing Library (RTL)

### Component Tests
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### Form Testing
```typescript
it('submits form with valid data', async () => {
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});

it('shows validation errors', async () => {
  render(<LoginForm />);

  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
});
```

### Async Testing
```typescript
it('loads and displays data', async () => {
  render(<UserList />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Accessibility Tests
```typescript
it('is accessible', async () => {
  const { container } = render(<Form />);

  // Check for ARIA labels
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

  // Keyboard navigation
  await userEvent.tab();
  expect(screen.getByLabelText(/email/i)).toHaveFocus();
});
```

## Coverage Target
- Overall: 80%+
- Components: 80%+
- Utils: 90%+

## Tools
- Bash: npm test, npm run test:coverage
- Read: Components to test
- Write: Test files
