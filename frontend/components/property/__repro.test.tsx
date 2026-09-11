import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PropertyForm from "@/components/property/PropertyForm";

beforeEach(() => {
  vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:mock"), revokeObjectURL: vi.fn() });
});

describe("repro: custom tag is invisible", () => {
  it("shows the custom tag as a selected chip", async () => {
    const user = userEvent.setup();
    render(<PropertyForm action={vi.fn(() => Promise.resolve({}))} hostName="M" hostPicture={null} />);

    await user.type(screen.getByLabelText("Ajouter une catégorie personnalisée"), "Spa");
    await user.click(screen.getByRole("button", { name: "+Ajouter un tag" }));

    // A predefined chip that is selected is visible and pressed...
    await user.click(screen.getByRole("button", { name: "Parc" }));
    expect(screen.getByRole("button", { name: "Parc" })).toHaveAttribute("aria-pressed", "true");

    // ...but the custom tag has no chip at all.
    expect(screen.getByRole("button", { name: "Spa" })).toBeInTheDocument();
  });
});
