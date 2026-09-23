import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeletePropertyButton from "./DeletePropertyButton";

vi.mock("@/lib/property-actions", () => ({
  deletePropertyAction: vi.fn(),
}));

const { deletePropertyAction } = await import("@/lib/property-actions");

const TRIGGER = "Supprimer l'annonce « Maison bord de mer »";

function renderButton() {
  render(
    <DeletePropertyButton
      variant="icon"
      propertyId="abc123"
      propertyTitle="Maison bord de mer"
    />
  );

  return screen.getByRole("button", { name: TRIGGER });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DeletePropertyButton", () => {
  it("opens the confirmation with focus on Annuler", async () => {
    const user = userEvent.setup();
    await user.click(renderButton());

    expect(
      screen.getByRole("dialog", { name: "Supprimer cette annonce ?" })
    ).toHaveTextContent(
      "« Maison bord de mer » sera définitivement supprimée. Cette action est irréversible."
    );
    expect(screen.getByRole("button", { name: "Annuler" })).toHaveFocus();
  });

  it("closes on Annuler and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const trigger = renderButton();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(deletePropertyAction).not.toHaveBeenCalled();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const trigger = renderButton();

    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(deletePropertyAction).not.toHaveBeenCalled();
  });

  it("runs the deletion on Supprimer", async () => {
    vi.mocked(deletePropertyAction).mockResolvedValueOnce({ error: "" });
    const user = userEvent.setup();

    await user.click(renderButton());
    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    expect(deletePropertyAction).toHaveBeenCalledWith("abc123");
  });

  it("renders the full variant as a labelled button that opens the dialog", async () => {
    const user = userEvent.setup();
    render(
      <DeletePropertyButton
        variant="full"
        propertyId="abc123"
        propertyTitle="Maison bord de mer"
      />
    );

    await user.click(screen.getByRole("button", { name: "Supprimer l'annonce" }));

    expect(
      screen.getByRole("dialog", { name: "Supprimer cette annonce ?" })
    ).toBeInTheDocument();
  });

  it("keeps the dialog open and shows the error", async () => {
    vi.mocked(deletePropertyAction).mockResolvedValueOnce({
      error: "Vous ne pouvez supprimer que vos propres annonces.",
    });
    const user = userEvent.setup();

    await user.click(renderButton());
    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Vous ne pouvez supprimer que vos propres annonces."
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
