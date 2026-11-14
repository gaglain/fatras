# Architecture rules

- The Resend event receiver uses its dedicated endpoint signing secret, with the legacy name as a fallback, and rejects unsigned event deliveries because each provider webhook has a distinct signature.
- Resend webhook monitoring reads provider delivery history server-side for administrators only and replays through the provider, so no signing secret or privileged credential reaches the browser.
- Persist the provider event ID and original timestamp in Resend analytics, with a unique index on that ID, so retries do not inflate engagement or change its chronology.
- Booking email drafting uses an authenticated management-team Edge Function with request-local Lovable AI Responses streaming and server-resolved show/template facts; generated plain text is escaped into a reviewable draft and never sent automatically.