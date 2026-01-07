# Feature Modules

This folder contains barrel exports for feature-based component organization.

## Usage

Import from specific feature modules instead of the root `components` folder:

```tsx
// ✅ Good - import from feature module
import { Layout, Header } from '@/components/features/layout';
import { Shop, ProductForm } from '@/components/features/shop';
import { EmailInbox, EmailSender } from '@/components/features/email';

// ❌ Avoid - importing from root (still works but less organized)
import { Layout } from '@/components/Layout';
```

## Available Modules

| Module | Description |
|--------|-------------|
| `layout/` | Layout, Header, Sidebar components |
| `artists/` | Artist management components |
| `email/` | Email, campaigns, templates |
| `shop/` | Products, cart, orders |
| `website/` | CMS, SEO, front-facing components |
| `notifications/` | Notification center, banners |
| `contacts/` | Contact management |
| `media/` | File upload, image optimization |
| `shared/` | Shared utilities, editors |
| `analytics/` | Google Analytics, Facebook Pixel |
| `chat/` | Chat widgets |
| `quotes/` | Quote and opportunity editors |

## Note

Do NOT create a main `index.ts` that re-exports all modules at once.
This can cause React initialization issues with Vite's module system.
Always import from specific feature modules.
