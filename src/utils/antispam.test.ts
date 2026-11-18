import { describe, it, expect } from "vitest";
import { isSpam } from "../../supabase/functions/_shared/antispam";
const real = "Bonjour, nous organisons un festival à Chalon et aimerions accueillir votre spectacle en juillet.";
describe("antispam formulaires", () => {
  it("laisse passer un vrai message", () => expect(isSpam({ text: real, elapsedMs: 40000 })).toBe(false));
  it("ne rejette pas un champ piège rempli seul (autofill)", () => expect(isSpam({ text: real, honeypot: "x", elapsedMs: 40000 })).toBe(false));
  it("rejette un envoi en moins de 2,5 s", () => expect(isSpam({ text: real, elapsedMs: 800 })).toBe(true));
  it("rejette 3 liens ou plus", () => expect(isSpam({ text: "http://a.com http://b.com www.c.com", elapsedMs: 40000 })).toBe(true));
  it("rejette les mots typiques de spam", () => expect(isSpam({ text: "Best SEO service for you", elapsedMs: 40000 })).toBe(true));
});
