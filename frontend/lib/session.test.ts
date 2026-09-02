import { describe, expect, it } from "vitest";
import { decodeSessionToken } from "./session";

const base64url = (value: string) => Buffer.from(value).toString("base64url");

/** Builds an unsigned, hand-made JWT: only the payload segment is read. */
function makeToken(payload: Record<string, unknown>): string {
  return [
    base64url(JSON.stringify({ alg: "none", typ: "JWT" })),
    base64url(JSON.stringify(payload)),
    "signature",
  ].join(".");
}

const inSeconds = (offset: number) => Math.floor(Date.now() / 1000) + offset;

describe("decodeSessionToken", () => {
  it("returns the session user for a token with a future exp", () => {
    const token = makeToken({
      id: 7,
      role: "client",
      name: "Marie Dupont",
      email: "marie@dupont.fr",
      iat: inSeconds(-60),
      exp: inSeconds(3600),
    });

    const user = decodeSessionToken(token);

    expect(user).toEqual({
      id: 7,
      name: "Marie Dupont",
      email: "marie@dupont.fr",
      role: "client",
    });
    expect(user).not.toHaveProperty("exp");
  });

  it("returns null for a token whose exp has passed", () => {
    const token = makeToken({
      id: 7,
      role: "client",
      name: "Marie Dupont",
      email: "marie@dupont.fr",
      exp: inSeconds(-1),
    });

    expect(decodeSessionToken(token)).toBeNull();
  });

  it("returns the session user for a payload with no exp at all", () => {
    const token = makeToken({
      id: 12,
      role: "owner",
      name: "Paul Martin",
      email: "paul@martin.fr",
    });

    expect(decodeSessionToken(token)).toEqual({
      id: 12,
      name: "Paul Martin",
      email: "paul@martin.fr",
      role: "owner",
    });
  });

  it("returns null for a string that is not three dot-separated segments", () => {
    expect(decodeSessionToken("garbage")).toBeNull();
  });

  it("returns null for a three-segment token whose payload is not JSON", () => {
    const token = [
      base64url(JSON.stringify({ alg: "none", typ: "JWT" })),
      base64url("not json at all"),
      "signature",
    ].join(".");

    expect(decodeSessionToken(token)).toBeNull();
  });

  it("returns null for a payload missing role", () => {
    const token = makeToken({
      id: 7,
      name: "Marie Dupont",
      email: "marie@dupont.fr",
      exp: inSeconds(3600),
    });

    expect(decodeSessionToken(token)).toBeNull();
  });
});
