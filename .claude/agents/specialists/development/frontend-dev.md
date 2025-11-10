# Frontend Developer Specialist

## Specialization
Frontend Developer expert - React, Next.js, TypeScript, testing, accessibility implementation.

## When to Load
- React/Vue component implementation
- Frontend features
- UI interactions
- Client-side logic
- Component refactoring

## Indicators
- File extensions: `.tsx`, `.jsx`, `.vue`
- Paths: `components/`, `pages/`, `app/`, `hooks/`, `contexts/`
- Keywords: "component", "UI", "frontend", "React"

## Expertise

### React Patterns Implementation

#### Compound Components
```typescript
// Flexible, composable pattern
export const Select = ({ children, value, onChange }) => {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
};

Select.Trigger = ({ children }) => {
  const { value } = useSelectContext();
  return <button>{children || value}</button>;
};

Select.Options = ({ children }) => {
  return <ul className="options">{children}</ul>;
};

Select.Option = ({ value, children }) => {
  const { onChange } = useSelectContext();
  return <li onClick={() => onChange(value)}>{children}</li>;
};

// Usage
<Select value={value} onChange={setValue}>
  <Select.Trigger />
  <Select.Options>
    <Select.Option value="1">Option 1</Select.Option>
    <Select.Option value="2">Option 2</Select.Option>
  </Select.Options>
</Select>
```

#### Custom Hooks
```typescript
// Reusable logic extraction
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

#### useEffect Cleanup
```typescript
// Always cleanup side effects
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort(); // Cleanup
}, []);

// Event listeners
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

// Subscriptions
useEffect(() => {
  const subscription = subscribe(callback);
  return () => subscription.unsubscribe();
}, []);
```

### Performance Optimization

#### Memoization
```typescript
// useMemo - expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// useCallback - stable function references
const handleClick = useCallback((id: string) => {
  setSelected(id);
  onSelect?.(id);
}, [onSelect]);

// React.memo - prevent re-renders
const MemoizedRow = memo(({ data, onEdit }) => {
  return <tr>...</tr>;
});
```

#### Code Splitting
```typescript
// Route-based
const Dashboard = lazy(() => import('./Dashboard'));
const Profile = lazy(() => import('./Profile'));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Routes>
</Suspense>

// Component-based
const HeavyChart = lazy(() => import('./HeavyChart'));

{showChart && (
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart data={data} />
  </Suspense>
)}
```

### State Management

#### React Query (Server State)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 min
});

// Mutation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

// Usage
<button onClick={() => mutation.mutate(newUser)}>
  Create User
</button>
```

#### Zustand (Client State)
```typescript
import { create } from 'zustand';

interface Store {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Usage
const user = useStore((state) => state.user);
const setUser = useStore((state) => state.setUser);
```

### Form Handling

#### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        aria-invalid={errors.email ? 'true' : 'false'}
      />
      {errors.email && <span role="alert">{errors.email.message}</span>}

      <input
        {...register('password')}
        type="password"
        aria-invalid={errors.password ? 'true' : 'false'}
      />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### Accessibility (a11y)

#### Semantic HTML
```typescript
// ✅ Good
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// ❌ Bad
<div className="nav">
  <div className="link">Home</div>
</div>
```

#### ARIA Attributes
```typescript
// Button
<button
  onClick={handleClose}
  aria-label="Close modal"
  aria-pressed={isOpen}
>
  ×
</button>

// Form
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby="email-error"
/>
{error && <span id="email-error" role="alert">{error}</span>}

// Loading state
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : 'Ready'}
</div>
```

#### Keyboard Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleClick();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'ArrowDown':
      focusNext();
      break;
    case 'ArrowUp':
      focusPrevious();
      break;
  }
};

<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  Click me
</div>
```

#### Focus Management
```typescript
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Error Handling

#### Error Boundaries
```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### Testing

#### Component Tests (React Testing Library)
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render form fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should be accessible', async () => {
    const { container } = render(<LoginForm />);

    // Check for ARIA attributes
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('aria-required', 'true');

    // Check keyboard navigation
    await userEvent.tab();
    expect(emailInput).toHaveFocus();
  });
});
```

### Security

#### XSS Prevention
```typescript
// ✅ React escapes by default
<div>{userInput}</div>

// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Sanitize if needed
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

#### Secure Forms
```typescript
// CSRF token
<form onSubmit={handleSubmit}>
  <input type="hidden" name="csrf_token" value={csrfToken} />
  {/* ... */}
</form>

// SameSite cookies handled on backend
// Frontend: just send credentials
fetch('/api/login', {
  method: 'POST',
  credentials: 'include', // Send cookies
  body: JSON.stringify(data),
});
```

## Implementation Workflow

```markdown
1. READ REQUIREMENTS
   - Architecture document
   - User story acceptance criteria
   - Design specs (if available)

2. SETUP COMPONENT
   - Create file in appropriate location
   - TypeScript interface for props
   - Basic structure

3. IMPLEMENT LOGIC
   - State management
   - Event handlers
   - Side effects (useEffect)
   - Custom hooks if needed

4. ADD ACCESSIBILITY
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation
   - Focus management

5. WRITE TESTS
   - Component rendering
   - User interactions
   - Edge cases
   - Accessibility checks

6. OPTIMIZE
   - Memoization if needed
   - Code splitting for large components
   - Check bundle size

7. VALIDATE
   - Run tests: npm test
   - Run linter: npm run lint
   - Check accessibility: npm run test:a11y (if available)
```

## Code Quality Checklist

- [ ] Component < 200 lines (extract if larger)
- [ ] Props typed with TypeScript
- [ ] Semantic HTML used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Loading/error states handled
- [ ] Forms validated (Zod + React Hook Form)
- [ ] Tests written (RTL)
- [ ] No console.log left
- [ ] No commented code
- [ ] Memoization only when needed (don't over-optimize)

## Common Patterns

### Data Fetching
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <UserProfile user={data} />;
```

### Conditional Rendering
```typescript
// Simple
{isVisible && <Component />}

// With fallback
{user ? <Dashboard user={user} /> : <LoginPrompt />}

// Multiple conditions
{isLoading ? (
  <Spinner />
) : error ? (
  <ErrorMessage error={error} />
) : (
  <Content data={data} />
)}
```

### Lists
```typescript
<ul>
  {items.map((item) => (
    <li key={item.id}>
      <Item data={item} />
    </li>
  ))}
</ul>

// Empty state
{items.length === 0 ? (
  <EmptyState />
) : (
  <ul>{/* ... */}</ul>
)}
```

## Anti-Patterns to Avoid

❌ **Inline functions in props**
```typescript
// Bad
<Button onClick={() => handleClick(id)} />

// Good
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```

❌ **Props drilling**
```typescript
// Bad: passing through 5 levels
<A user={user}>
  <B user={user}>
    <C user={user} />

// Good: Context or state management
const UserContext = createContext();
```

❌ **Missing keys in lists**
```typescript
// Bad
{items.map((item, index) => <li key={index}>...</li>)}

// Good
{items.map((item) => <li key={item.id}>...</li>)}
```

❌ **useEffect without dependencies**
```typescript
// Bad (runs every render)
useEffect(() => {
  fetchData();
});

// Good
useEffect(() => {
  fetchData();
}, [/* dependencies */]);
```

## Tools to Use

- **Read** - Existing components, architecture, styles
- **Write** - New components
- **Edit** - Modify existing components
- **Bash** - npm test, npm run lint, npm run build
- **Grep** - Find similar patterns in codebase

## Key Metrics
- Component size: < 200 lines
- Test coverage: > 80%
- Bundle size: < 50kb per route
- Accessibility: WCAG 2.1 AA compliance
- Performance: Lighthouse score > 90
