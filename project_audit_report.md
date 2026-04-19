# Project Audit Report: contentv2

This report outlines the potential problems, architectural bottlenecks, and code quality issues identified in the `contentv2` project.

## 1. Architectural & Performance Bottlenecks

### 🚨 Heavy User Middleware (Performance)
The `UserMiddleware` is applied to all routes (`*`) and performs a database lookup and an update/create operation on **every single request**.
- **Impact**: Significant latency on every API call and unnecessary database load.
- **Recommendation**:
  - Implement a caching mechanism (e.g., Redis or in-process cache) for user details.
  - Only update the user record if the data has significantly changed or after a set interval (e.g., once per session).
  - Use `NestJS Guards` for specific routes instead of a global middleware to avoid overhead on public/unauthenticated routes.

### 🚨 Memory Intensive Seeding (Scalability)
The `SeedService.seedCommodities` loads the entire `commodities.csv` (currently 47MB) into an array in memory.
- **Impact**: Risk of `OutOfMemory` errors as the data grows.
- **Recommendation**:
  - Refactor to process the stream directly and batch the database inserts using `createMany` without accumulating all records in an array first.

### 🚨 Restrictive Middleware Policy
Applying both `UserMiddleware` and `SubscriptionMiddleware` to `*` in `AppModule` makes the entire API private by default.
- **Impact**: Future public endpoints (health checks, legal pages, webhooks) will fail without an `Authorization` header and an active subscription.
- **Recommendation**:
  - Use `exclude` in `.forRoutes()` or migrate to `Guards` with custom decorators (e.g., `@Public()`).

---

## 2. Infrastructure & Best Practices

### ⚠️ Filename Inconsistency
`src/repositories/subscription.respository.ts` contains a typo (`respository`). 
- **Impact**: Makes the codebase feel unpolished and can lead to import issues if people assume standard spelling.
- **Recommendation**: Rename to `subscription.repository.ts`.

### ⚠️ Global Prisma Instance
The project uses a global `prisma` singleton imported from `src/common/prisma.ts`.
- **Impact**: This bypasses NestJS's dependency injection system, making testing harder and breaking standard lifecycle hooks.
- **Recommendation**: Create a `PrismaService` that extends `PrismaClient` and inject it where needed.

### ⚠️ Stubbed Modules
Several key areas are currently placeholders:
- `ApiKeyService`: Minimal logic; `revoke` and `list` are empty.
- `WebhookModule`: Completely empty.
- `TopupModule`: Mostly empty.

---

## 3. Reliability & Security

### ⚠️ Lack of Request Validation
Controllers currently use `any` for request bodies (e.g., `PaymentController.createPayment(@Body() body: any)`).
- **Impact**: No compile-time or runtime validation of incoming data.
- **Recommendation**:
  - Define DTOs using `class-validator` and `class-transformer`.
  - Enable `ValidationPipe` globally in `main.ts`.

### ⚠️ Token Expiry in Background Jobs
The `PaymentService` enqueues processing jobs with a 2-minute delay and passes the `authorization` token along.
- **Impact**: If the token expires during the delay or retries, the job will fail when calling external integration services.
- **Recommendation**: Store the necessary user metadata or a long-lived internal token instead of relying on the user's short-lived SSO token in background jobs.

### ⚠️ Incomplete Integration
In `PaymentService`, `integrationsService` is hardcoded to `null`.
- **Impact**: Credits to user balances are currently not being executed upon successful payment.
- **Recommendation**: Properly inject or implement the `IntegrationsService`.

---

## 4. Code Quality & Maintenance

### 🧹 Cleaning Up Debug Logs
Multiple `console.log` statements with "pppppp" strings exist in `PaystackService` and `ApiKeyController`.
- **Recommendation**: Replace with a proper `Logger` and remove debug artifacts before production.

### 🧹 Hardcoded Business Logic
- **Country**: Defaulted to "Ghana" in `SeedService`.
- **Currency**: Hardcoded "GHS" in `SeedService`.
- **Gateway**: Hardcoded `MOBILE_MONEY` in `PaymentService`.
- **Recommendation**: Move these to configuration files or database settings to allow for future expansion.

---

## Conclusion
The project has a solid foundation with NestJS and Prisma, but the **Global Middleware strategy** and **In-memory CSV processing** are immediate risks to performance and stability. Tackling the "stubbed" functionality and adding validation through DTOs should be the next priority.
