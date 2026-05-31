# Admin User Observability Spec

## 1. Objective
Provide support-grade visibility into user behavior after login, including:
- Auth and onboarding outcomes
- Purchases/subscriptions/credits
- Product usage requests and failures
- Admin-auditable timelines per user

This spec defines frontend telemetry, backend ingestion/query APIs, and admin UI requirements.

## 2. Problem Statement
Current dev frontend has low visibility:
- No centralized telemetry (mostly console logs)
- No per-user timeline in admin
- No purchase/credit/request dashboard
- No correlation IDs across frontend and backend logs

Result: support incidents like "I logged in and got an error" are hard to diagnose quickly.

## 3. Scope
### In scope
- Frontend event instrumentation and transport
- Correlation IDs for API calls
- Backend event ingestion endpoint + storage model
- Admin views for activity, purchases, credits, failures
- Support triage workflow

### Out of scope
- Full BI warehouse work
- Marketing analytics
- Replacing Stripe/Firebase source systems

## 4. Architecture
### 4.1 Event Flow
1. Frontend emits structured event
2. Frontend sends to backend `POST /client-logs` (batched)
3. Backend enriches (request id, env, receivedAt) and stores in `user_activity_events`
4. Admin UI reads rollups + timeline via query APIs

### 4.2 Correlation
Every frontend API request includes:
- `x-client-request-id` (UUID)
- `x-client-session-id` (UUID per tab/session)

Backend logs + error responses include `requestId` and echo client request id when present.

## 5. Event Model
Collection: `user_activity_events`

```json
{
  "_id": "ObjectId",
  "eventId": "uuid",
  "eventType": "create_user_failed",
  "occurredAt": "2026-03-17T15:02:30.000Z",
  "receivedAt": "2026-03-17T15:02:31.120Z",
  "environment": "prod",
  "user": {
    "firebaseUid": "vfY4...",
    "userId": "699e...",
    "email": "user@example.com"
  },
  "request": {
    "route": "/onboarding/confirmation",
    "apiEndpoint": "/createUserEmailValidation",
    "method": "POST",
    "statusCode": 401,
    "backendCode": "MISSING_TOKEN",
    "clientRequestId": "uuid",
    "sessionId": "uuid"
  },
  "app": {
    "version": "2026.03.17.1",
    "platform": "web",
    "browser": "Chrome 134"
  },
  "meta": {
    "message": "No authorization header provided",
    "attempt": 2,
    "maxAttempts": 3,
    "context": {}
  }
}
```

## 6. Required Event Types
### Auth/Onboarding
- `login_started`
- `login_succeeded`
- `login_failed`
- `password_reset_requested`
- `create_user_started`
- `create_user_succeeded`
- `create_user_failed`

### Purchase/Credits
- `checkout_started`
- `checkout_redirected`
- `checkout_completed_client`
- `portal_opened`
- `entitlements_fetch_failed`

### Product usage
- `analysis_start_requested`
- `analysis_start_failed`
- `analysis_completed`
- `chat_request_sent`
- `chat_request_failed`

### Admin actions
- `admin_view_user`
- `admin_delete_user_started`
- `admin_delete_user_succeeded`
- `admin_delete_user_failed`

## 7. Backend API Contract
### 7.1 Ingest
`POST /client-logs`

Body:
```json
{
  "events": [
    {
      "eventId": "uuid",
      "eventType": "create_user_failed",
      "occurredAt": "ISO-8601",
      "user": {"firebaseUid":"...","userId":"...","email":"..."},
      "request": {"route":"...","apiEndpoint":"...","statusCode":401,"backendCode":"MISSING_TOKEN","clientRequestId":"...","sessionId":"..."},
      "meta": {"message":"..."}
    }
  ]
}
```

Response:
```json
{ "success": true, "accepted": 1, "rejected": 0 }
```

### 7.2 Query APIs (admin)
- `GET /admin/users/:userId/activity?from=&to=&types=&page=&limit=`
- `GET /admin/users/:userId/summary?from=&to=`
- `GET /admin/users/:userId/purchases`
- `GET /admin/users/:userId/credits/ledger`
- `GET /admin/activity/search?email=&firebaseUid=&errorCode=&from=&to=`

## 8. Admin UI Requirements
### 8.1 User row additions
Add columns to Account Owners table:
- Last active
- Requests (24h / 7d)
- Failed requests (24h)
- Plan / subscription status
- Credit balance (monthly + pack)
- Lifetime purchases (USD)

### 8.2 User detail drawer/page
Tabs:
1. Timeline
2. Purchases
3. Credits
4. API Failures
5. Sessions

### 8.3 Failure-first support view
Default sort by recent failures.
Quick filters:
- `MISSING_TOKEN`, `INVALID_TOKEN`, `OWNER_MISMATCH`, `EMAIL_EXISTS`, `INSUFFICIENT_CREDITS`

## 9. Security + Privacy
- Admin query APIs require server-validated admin auth (no client-only password)
- PII minimization in telemetry (no birth data, no full prompts)
- Hash/truncate sensitive payload fields where possible
- Retention policy:
  - Raw events: 30-90 days
  - Rollups: 12 months

## 10. Rollout Plan
### Phase 1 (1-2 days)
- Add frontend shared telemetry emitter
- Add `x-client-request-id` and `x-client-session-id`
- Add event instrumentation for auth + create-user + checkout start/fail

### Phase 2 (2-4 days)
- Implement `/client-logs` ingestion + storage
- Structured backend request logs with correlation IDs

### Phase 3 (3-5 days)
- Build admin User Activity drawer with timeline + failure filters
- Add purchases + credits summary cards

### Phase 4 (optional)
- Alerts: spike detection on `create_user_failed`, `login_failed`
- Daily support report

## 11. Acceptance Criteria
- Given a reported incident email + time, support can identify root cause within 5 minutes
- 95%+ of frontend API failures produce a persisted telemetry event with correlation IDs
- Admin can view per-user purchases, credit ledger, and activity timeline in one place
- Create-user/auth incidents are searchable by `firebaseUid`, email, or error code

## 12. Open Questions
- Preferred telemetry sink: Sentry/LogRocket vs internal `/client-logs`
- Final retention duration and cost limits
- Which admin roles can view payment-level details
