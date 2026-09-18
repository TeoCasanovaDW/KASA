import { describe, expect, it } from "vitest";
import { authUrl, RETURN_TO, safeNext } from "./auth-redirect";

describe("safeNext", () => {
  it("accepts every listed destination", () => {
    for (const destination of RETURN_TO) {
      expect(safeNext(destination)).toBe(destination);
    }
  });

  it("sends anything else home", () => {
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext("")).toBe("/");
    expect(safeNext(["/profil", "/messagerie"])).toBe("/");
    // Near-misses: only an exact match counts.
    expect(safeNext("/profil/")).toBe("/");
    expect(safeNext("/Profil")).toBe("/");
    expect(safeNext("/messagerie/7?logement=abc")).toBe("/");
    // Inherited object keys must not behave like list entries.
    expect(safeNext("constructor")).toBe("/");
    expect(safeNext("toString")).toBe("/");
  });

  // Kept as a record of what an earlier URL-validating version let through.
  // None of it can reach `redirect()` now: a value that is not one of the four
  // literals is never returned, whatever it contains.
  it("sends every known open-redirect payload home", () => {
    const payloads = [
      "https://evil.example/",
      "//evil.example/",
      "///evil.example/",
      "/\evil.example/",
      "/\t/evil.example/",
      "/\n/evil.example/",
      "/.//evil.example",
      "/..//evil.example",
      "/profil/..//evil.example",
      "/%2e//evil.example",
      "javascript:alert(1)",
    ];

    for (const payload of payloads) {
      expect(safeNext(payload)).toBe("/");
    }
  });
});

describe("authUrl", () => {
  it("names the destination", () => {
    expect(authUrl("/connexion", "/ajouter-un-logement")).toBe(
      "/connexion?next=%2Fajouter-un-logement"
    );
  });

  it("leaves the plain link alone when the destination is the home page", () => {
    expect(authUrl("/connexion", "/")).toBe("/connexion");
  });

  it("round-trips through safeNext", () => {
    for (const destination of RETURN_TO) {
      const url = new URL(authUrl("/connexion", destination), "https://kasa.fr");

      expect(safeNext(url.searchParams.get("next") ?? undefined)).toBe(
        destination
      );
    }
  });
});
