import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HeaderAuth from "./HeaderAuth";
import type { SessionUser } from "@/types/user";

// `@/lib/auth-actions` and `@/lib/session` are server-only modules that cannot
// be imported under Vitest; the header only needs their return values.
const { getSessionUser, getUserById, logoutAction } = vi.hoisted(() => ({
  getSessionUser: vi.fn<() => Promise<SessionUser | null>>(),
  getUserById: vi.fn(),
  logoutAction: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ getSessionUser }));
vi.mock("@/lib/users-api", () => ({ getUserById }));
vi.mock("@/lib/auth-actions", () => ({ logoutAction }));

const user: SessionUser = {
  id: 7,
  name: "Marie Curie",
  email: "marie@example.com",
  role: "client",
};

const TRIGGER_NAME = "Marie, ouvrir le menu du compte";

async function renderAuth(variant: "desktop" | "mobile" = "desktop") {
  render(await HeaderAuth({ variant }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HeaderAuth, logged out", () => {
  beforeEach(() => {
    getSessionUser.mockResolvedValue(null);
  });

  it("offers the login icon as an accessible link to /connexion", async () => {
    await renderAuth();

    const link = screen.getByRole("link", { name: "Se connecter" });
    expect(link).toHaveAttribute("href", "/connexion");
    expect(link.querySelector("svg")).toBeInTheDocument();
  });

  it("carries no visible label in the desktop nav", async () => {
    await renderAuth();

    expect(screen.getByRole("link")).toHaveTextContent("");
  });

  it("keeps the label in the mobile panel's list", async () => {
    await renderAuth("mobile");

    expect(screen.getByRole("link")).toHaveTextContent("Se connecter");
  });
});

describe("HeaderAuth, logged in", () => {
  beforeEach(() => {
    getSessionUser.mockResolvedValue(user);
  });

  it("shows the avatar menu instead of an exposed logout control", async () => {
    getUserById.mockResolvedValue({ picture: null });
    await renderAuth();

    expect(screen.getByRole("button", { name: TRIGGER_NAME })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Se déconnecter" }),
    ).not.toBeInTheDocument();
  });

  it("uses the profile picture returned for the session user", async () => {
    getUserById.mockResolvedValue({ picture: "/uploads/marie.jpg" });
    await renderAuth();

    expect(getUserById).toHaveBeenCalledWith(user.id);
    expect(screen.getByRole("button").querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("marie.jpg"),
    );
  });

  it("still renders the menu when the picture lookup fails", async () => {
    getUserById.mockRejectedValue(new Error("unavailable"));
    await renderAuth();

    expect(screen.getByRole("button", { name: TRIGGER_NAME })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
