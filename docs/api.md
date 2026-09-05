# API Documentation

API routes live under `app/api/`. All routes require JWT auth unless marked public.

Document each endpoint as you build it:

```
## POST /api/example
**Auth:** Required (JWT)
**Body:** { field: string }
**Response:** { id: string, created_at: string }
**Errors:** 400 validation, 401 unauthorized, 500 server error
```
