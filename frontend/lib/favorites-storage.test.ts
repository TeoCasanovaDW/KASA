import { beforeEach, describe, expect, it } from "vitest";
import { readFavoriteIds, writeFavoriteIds } from "./favorites-storage";

const STORAGE_KEY = "kasa:favorites";

beforeEach(() => {
  localStorage.clear();
});

describe("favorites-storage", () => {
  it("returns [] when nothing has been stored yet", () => {
    expect(readFavoriteIds()).toEqual([]);
  });

  it("round-trips a write with a read", () => {
    writeFavoriteIds(["a", "b"]);
    expect(readFavoriteIds()).toEqual(["a", "b"]);
  });

  it("returns [] for malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(readFavoriteIds()).toEqual([]);
  });

  it("returns [] for valid JSON that isn't an array (number)", () => {
    localStorage.setItem(STORAGE_KEY, "42");
    expect(readFavoriteIds()).toEqual([]);
  });

  it("returns [] for valid JSON that isn't an array (object)", () => {
    localStorage.setItem(STORAGE_KEY, "{}");
    expect(readFavoriteIds()).toEqual([]);
  });

  it("keeps only string entries from a mixed array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", 1, null, "b", true]));
    expect(readFavoriteIds()).toEqual(["a", "b"]);
  });
});
