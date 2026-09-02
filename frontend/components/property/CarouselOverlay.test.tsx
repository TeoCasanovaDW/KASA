import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CarouselOverlay from "./CarouselOverlay";

const pictures = [
  "/pictures/photo-1.jpg",
  "/pictures/photo-2.jpg",
  "/pictures/photo-3.jpg",
  "/pictures/photo-4.jpg",
];
const title = "Appartement cosy";

function renderOverlay(overrides?: Partial<{ startIndex: number; pictures: string[] }>) {
  const onClose = vi.fn();
  const utils = render(
    <CarouselOverlay
      pictures={overrides?.pictures ?? pictures}
      startIndex={overrides?.startIndex ?? 0}
      title={title}
      onClose={onClose}
    />,
  );
  return { onClose, ...utils };
}

describe("CarouselOverlay", () => {
  it("shows the picture at startIndex on mount", () => {
    renderOverlay({ startIndex: 2 });

    expect(screen.getByAltText(`${title} — photo 3 sur 4`)).toBeInTheDocument();
  });

  it("advances with the next control and goes back with the previous control", async () => {
    const user = userEvent.setup();
    renderOverlay({ startIndex: 0 });

    await user.click(screen.getByRole("button", { name: "Image suivante" }));
    expect(screen.getByAltText(`${title} — photo 2 sur 4`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Image précédente" }));
    expect(screen.getByAltText(`${title} — photo 1 sur 4`)).toBeInTheDocument();
  });

  it("wraps past both ends", async () => {
    const user = userEvent.setup();
    renderOverlay({ startIndex: pictures.length - 1 });

    await user.click(screen.getByRole("button", { name: "Image suivante" }));
    expect(screen.getByAltText(`${title} — photo 1 sur 4`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Image précédente" }));
    expect(screen.getByAltText(`${title} — photo 4 sur 4`)).toBeInTheDocument();
  });

  it("navigates with ArrowRight and ArrowLeft", async () => {
    const user = userEvent.setup();
    renderOverlay({ startIndex: 0 });

    await user.keyboard("{ArrowRight}");
    expect(screen.getByAltText(`${title} — photo 2 sur 4`)).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByAltText(`${title} — photo 1 sur 4`)).toBeInTheDocument();
  });

  it("calls onClose on Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderOverlay();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderOverlay();

    await user.click(screen.getByRole("button", { name: "Fermer la galerie" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders no previous/next control and no counter for a single picture", () => {
    renderOverlay({ pictures: ["/pictures/photo-1.jpg"], startIndex: 0 });

    expect(
      screen.queryByRole("button", { name: "Image suivante" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Image précédente" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
  });

  it("moves focus inside the dialog on mount", () => {
    renderOverlay();

    expect(screen.getByRole("button", { name: "Fermer la galerie" })).toHaveFocus();
  });

  it("closes on a backdrop click but not on a click inside the dialog", async () => {
    const user = userEvent.setup();
    const { onClose } = renderOverlay();

    const dialog = screen.getByRole("dialog");
    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = dialog.parentElement;
    if (!backdrop) throw new Error("backdrop element not found");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("restores focus to the previously focused element after unmount", () => {
    render(<button>Ouvrir la photo 1 sur 4</button>);
    const trigger = screen.getByRole("button", { name: "Ouvrir la photo 1 sur 4" });
    trigger.focus();
    expect(trigger).toHaveFocus();

    const { unmount } = renderOverlay();
    expect(trigger).not.toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
  });

  it("traps Tab inside the dialog, wrapping at both ends", async () => {
    const user = userEvent.setup();
    renderOverlay();

    const closeButton = screen.getByRole("button", { name: "Fermer la galerie" });
    const previousButton = screen.getByRole("button", { name: "Image précédente" });
    const nextButton = screen.getByRole("button", { name: "Image suivante" });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(previousButton).toHaveFocus();

    await user.tab();
    expect(nextButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(nextButton).toHaveFocus();
  });
});
