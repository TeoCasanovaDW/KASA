import { beforeEach, describe, expect, it, vi } from "vitest";
import SiteLayout from "./layout";
import type { Property } from "@/types/property";
import type { SessionUser } from "@/types/user";

// `@/lib/session`, `@/lib/favorites-api` and the `"use server"` actions module
// are server-only and cannot be imported under Vitest; `SiteChrome` pulls in
// the same modules through `HeaderAuth`, and this layout's own logic does not
// need it rendered. Same approach as `HeaderAuth.test.tsx`.
const { getSessionUser, getFavorites, toggleFavoriteAction } = vi.hoisted(
  () => ({
    getSessionUser: vi.fn<() => Promise<SessionUser | null>>(),
    getFavorites: vi.fn<() => Promise<Property[]>>(),
    toggleFavoriteAction: vi.fn(),
  }),
);

vi.mock("@/lib/session", () => ({ getSessionUser }));
vi.mock("@/lib/favorites-api", () => ({ getFavorites }));
vi.mock("@/lib/favorites-actions", () => ({ toggleFavoriteAction }));
vi.mock("@/components/layout/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 7,
    name: "Marie Curie",
    email: "marie@example.com",
    role: "client",
    ...overrides,
  };
}

function makeProperty(id: Property["id"]): Property {
  return {
    id,
    slug: `logement-${id}`,
    title: "Villa bord de mer",
    description: null,
    cover: null,
    location: "Biarritz",
    price_per_night: 120,
    rating_avg: 4.5,
    ratings_count: 12,
  };
}

type ProviderProps = {
  signedIn: boolean;
  initialFavoriteIds: Property["id"][];
};

/**
 * The layout is inspected rather than rendered: `key` is React's own, not a
 * prop, so it is only readable on the element itself.
 */
async function renderedProvider() {
  const tree = (await SiteLayout({
    children: <div />,
    params: Promise.resolve({}),
  })) as React.ReactElement<{
    children: React.ReactElement<ProviderProps>;
  }>;

  return tree.props.children;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SiteLayout favorites provider", () => {
  it("passes the guest defaults and no favorites request when signed out", async () => {
    getSessionUser.mockResolvedValue(null);

    const provider = await renderedProvider();

    expect(provider.props.signedIn).toBe(false);
    expect(provider.props.initialFavoriteIds).toEqual([]);
    expect(getFavorites).not.toHaveBeenCalled();
  });

  it("seeds the ids of the account's favorites when signed in", async () => {
    getSessionUser.mockResolvedValue(makeUser());
    getFavorites.mockResolvedValue([makeProperty("1"), makeProperty("3")]);

    const provider = await renderedProvider();

    expect(provider.props.signedIn).toBe(true);
    expect(provider.props.initialFavoriteIds).toEqual(["1", "3"]);
  });

  it("degrades to an empty list when the favorites fetch fails", async () => {
    getSessionUser.mockResolvedValue(makeUser());
    getFavorites.mockRejectedValue(new Error("backend down"));

    const provider = await renderedProvider();

    expect(provider.props.initialFavoriteIds).toEqual([]);
  });

  // The regression: login and logout are soft navigations, so without a key
  // that changes with the visitor, the provider is reconciled in place and
  // keeps the previous list until a full reload.
  it("keys the provider per identity, guest and account apart", async () => {
    getSessionUser.mockResolvedValue(null);
    const guest = await renderedProvider();

    getSessionUser.mockResolvedValue(makeUser());
    getFavorites.mockResolvedValue([]);
    const first = await renderedProvider();

    getSessionUser.mockResolvedValue(makeUser({ id: 8 }));
    const second = await renderedProvider();

    expect(guest.key).toBe("guest");
    expect(first.key).toBe("user:7");
    expect(second.key).toBe("user:8");
  });
});
