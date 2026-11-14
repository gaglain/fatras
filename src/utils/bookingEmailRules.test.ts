import { expect, it } from 'vitest';
import { canDraftBookingEmail, bookingDraftHtml } from '../../supabase/functions/_shared/bookingEmailRules';

it('allows booking drafting for the management team but not artist-only accounts', () => {
  for (const role of ['admin','super_admin','manager','collaborator']) expect(canDraftBookingEmail([role])).toBe(true);
  expect(canDraftBookingEmail(['artiste'])).toBe(false);
  expect(canDraftBookingEmail(['user'])).toBe(false);
});
it('converts generated plain text to safe editable email HTML', () => {
  expect(bookingDraftHtml(['Bonjour <script>alert(1)</script>', 'Fatras & spectacle\nÀ bientôt'])).toBe('<p>Bonjour &lt;script&gt;alert(1)&lt;/script&gt;</p><p>Fatras &amp; spectacle<br>À bientôt</p>');
});