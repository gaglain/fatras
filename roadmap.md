# Resend webhook monitoring

## Personalized booking emails

- [x] Add programmer/show inputs and a reviewable AI draft in the email composer.
- [x] Generate through authenticated server-side Lovable AI with cancellation and visible errors.
- [x] Test draft safety rules (2 passing tests), actual SDK generation, function authentication rejection, and isolated desktop/mobile presentation. Authenticated end-to-end checks are unavailable for this external Supabase project.

- [x] Add an administrator-only Resend event monitor in Preferences.
- [x] Show delivery statuses, pagination and attempt errors from Resend.
- [x] Replay failed events through Resend with confirmation and deduplicated analytics.
- [x] Validate six tests, live replay receipt (HTTP 200), and isolated desktop/mobile rendering with actual provider data. Authenticated end-to-end checks are unavailable on this external Supabase project; no analytics row was found for the replayed event.