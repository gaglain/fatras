# Architecture rules

- The Resend event receiver uses its dedicated endpoint signing secret, with the legacy name as a fallback, and rejects unsigned event deliveries because each provider webhook has a distinct signature.