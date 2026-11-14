# Resend webhook monitoring

## Personalized booking emails

- [ ] Add programmer/show inputs and a reviewable AI draft in the email composer.
- [ ] Generate through authenticated server-side Lovable AI with cancellation and visible errors.
- [ ] Test draft safety rules, live generation, and desktop/mobile presentation.

- [x] Add an administrator-only Resend event monitor in Preferences.
- [x] Show delivery statuses, pagination and attempt errors from Resend.
- [x] Replay failed events through Resend with confirmation and deduplicated analytics.
- [x] Validate six tests, live replay receipt (HTTP 200), and isolated desktop/mobile rendering with actual provider data. Authenticated end-to-end checks are unavailable on this external Supabase project; no analytics row was found for the replayed event.