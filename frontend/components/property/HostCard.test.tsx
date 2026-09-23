import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HostCard from "./HostCard";
import type { PropertyHost } from "@/types/property";

vi.mock("@/lib/property-actions", () => ({
  deletePropertyAction: vi.fn(),
}));

const host: PropertyHost = {
  id: 42,
  name: "Marie Curie",
  picture: null,
};

const CTA_NAME = "Envoyer un message";
const DELETE_NAME = "Supprimer l'annonce";

function renderHostCard(currentUserId: number | null) {
  return render(
    <HostCard
      host={host}
      ratingAvg={4.5}
      propertyId="property-1"
      propertyTitle="Maison bord de mer"
      currentUserId={currentUserId}
    />,
  );
}

describe("HostCard", () => {
  it("hides the messaging CTA when the current user is the property's host", () => {
    renderHostCard(host.id);

    expect(screen.queryByRole("link", { name: CTA_NAME })).not.toBeInTheDocument();
  });

  it("shows the delete button when the current user is the property's host", () => {
    renderHostCard(host.id);

    expect(
      screen.getByRole("button", { name: DELETE_NAME }),
    ).toBeInTheDocument();
  });

  it("hides the delete button for anyone else", () => {
    renderHostCard(host.id + 1);

    expect(
      screen.queryByRole("button", { name: DELETE_NAME }),
    ).not.toBeInTheDocument();
  });

  it("shows the messaging CTA for another authenticated user", () => {
    renderHostCard(host.id + 1);

    const link = screen.getByRole("link", { name: CTA_NAME });
    expect(link).toHaveAttribute(
      "href",
      `/messagerie/${host.id}?logement=property-1`,
    );
  });

  it("shows the messaging CTA when logged out", () => {
    renderHostCard(null);

    expect(screen.getByRole("link", { name: CTA_NAME })).toBeInTheDocument();
  });
});
