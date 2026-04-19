# Project Analysis: contentv2

## Overview
`contentv2` is a NestJS-based backend application designed to handle content and provide API access via API keys. It integrates with an external SSO service for user authentication and uses Prisma for database management (PostgreSQL).

## Tech Stack
- **Framework**: NestJS (v11+)
- **ORM**: Prisma (v5.17.0)
- **Language**: TypeScript
- **HTTP Client**: Axios (for SSO integration)

## Core Components

### 1. Authentication & Middleware
- **`AuthenticationService`**: Handles communication with an external SSO service (`SSO_BASE_URL`).
- **`UserMiddleware`**: Intercepts requests, validates authorization headers against the SSO, and syncs user details into the local `User` table.

### 2. Repositories
- **`UserRepository`**: Provides methods to retrieve, save, and update user data. 
    - *Note*: There is a type mismatch in `updateUser` where the ID is expected as a `number`, but the schema defines it as a UUID `string`.

### 3. API Key Management
- **`ApiKeyModule`**: Intended to manage user API keys.
- **`ApiKeyService`**: Currently contains empty skeletons for `createApiKey`, `revokeApiKey`, and `listApiKeys`.

### 4. Database Schema (`schema.prisma`)
- **`User`**: Stores `firstName`, `lastName`, `email`, `phoneNumber`, `ssoUserId`, etc.
- **`ApiKey`**: Stores hashed API keys linked to users with status tracking (`ACTIVE`, `INACTIVE`, `REVOKED`, `EXPIRED`).

## Project Structure (Observations)
- Several directories are currently placeholders or empty:
    - `src/apis/webhook`
    - `src/config`
    - `src/crons`
    - `src/events`
    - `src/helpers` (except `authentication.ts`)
    - `src/queues`
    - `src/sms-gateway-client`
    - `src/utils`

## Immediate Recommendations
1. **Fix Type Mismatches**: Update `UserRepository.updateUser` to accept a `string` ID.
2. **Implement API Key Logic**:
    - Generate secure API keys.
    - Implement hashing (using `crypto` or `bcrypt`) before saving to `keyHash`.
    - Secure the `ApiKeyController` to ensure users can only manage their own keys.
3. **Configuration Management**: Populate `src/config` with dedicated configuration files to replace direct `configService.get()` calls if the project grows.
4. **Error Handling**: Enhance `UserMiddleware` error handling for clearer SSO failure responses.

## Future Plans
- Implementation of the SMS Gateway Client.
- Setup of Queues and Crons for background processing.
- Webhook integration for external notifications.
