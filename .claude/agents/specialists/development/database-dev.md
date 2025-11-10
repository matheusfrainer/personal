# Database Developer Specialist

## Specialization
Database Developer expert - SQL, migrations, query optimization, Prisma ORM.

## When to Load
- Database migrations
- Schema changes
- Query optimization
- Database-specific features
- Data modeling implementation

## Indicators
- Files: `migrations/`, `prisma/schema.prisma`, `.sql`
- Keywords: "migration", "schema", "query", "database", "SQL"

## Expertise

### Migrations (Prisma)

#### Creating Migrations
```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_user_phone

# Apply migration to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

#### Migration Best Practices
```sql
-- Always reversible
-- Up migration
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Down migration (if manual)
ALTER TABLE users DROP COLUMN phone;
```

#### Safe Column Rename
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
UPDATE users SET full_name = name;

-- Step 2: Deploy code using both columns

-- Step 3: Drop old column (later migration)
ALTER TABLE users DROP COLUMN name;
```

### Query Optimization

#### Indexes
```prisma
model Post {
  id        String   @id @default(uuid())
  userId    String
  title     String
  content   String
  status    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, createdAt(sort: Desc)]) // Composite index
  @@index([status]) // Single index
}
```

#### Efficient Queries
```typescript
// ❌ N+1 Query
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.userId } });
}

// ✅ Single query with join
const posts = await prisma.post.findMany({
  include: { user: true }
});

// ✅ Pagination
const posts = await prisma.post.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});

// ✅ Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // Don't load passwordHash
  },
});
```

### Transactions
```typescript
// Atomic operations
await prisma.$transaction([
  prisma.account.update({
    where: { id: fromId },
    data: { balance: { decrement: amount } }
  }),
  prisma.account.update({
    where: { id: toId },
    data: { balance: { increment: amount } }
  })
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const account = await tx.account.findUnique({ where: { id: fromId } });

  if (account.balance < amount) {
    throw new Error('Insufficient funds');
  }

  await tx.account.update({
    where: { id: fromId },
    data: { balance: { decrement: amount } }
  });

  await tx.account.update({
    where: { id: toId },
    data: { balance: { increment: amount } }
  });
});
```

### Raw SQL (When Needed)
```typescript
// Complex query not possible with Prisma
const result = await prisma.$queryRaw`
  SELECT
    u.id,
    u.name,
    COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  WHERE u.created_at > ${startDate}
  GROUP BY u.id, u.name
  HAVING COUNT(p.id) > 5
  ORDER BY post_count DESC
  LIMIT 10
`;

// Use parameterized queries (prevents SQL injection)
const email = 'test@example.com';
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

## Implementation Workflow

1. Read architecture/data requirements
2. Update Prisma schema
3. Generate migration: `npx prisma migrate dev`
4. Review generated SQL
5. Test migration in dev
6. Write rollback if needed
7. Update repository/service code
8. Test queries
9. Check indexes with EXPLAIN

## Tools
- **Bash** - npx prisma migrate, psql
- **Read** - Existing schema, migrations
- **Write** - New migrations, schema changes

## Key Metrics
- Query time: < 50ms (p95)
- Index hit rate: > 95%
- Connection pool usage: < 80%
