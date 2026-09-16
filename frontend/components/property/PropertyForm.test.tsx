import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PropertyForm from "./PropertyForm";
import { MAX_PICTURES } from "@/lib/property-form";

// Structural copy of `PropertyFormState`: the real type lives alongside the
// `"use server"` action.
type FormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

type ActionStub = (
  prevState: FormState,
  formData: FormData,
) => Promise<FormState>;

type User = ReturnType<typeof userEvent.setup>;

// jsdom does not implement object URLs; `ImageInput` only needs a stable
// string back to build its preview.
beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  });
});

function renderForm(action: ActionStub, reusableTags?: string[]) {
  const container = render(
    <PropertyForm
      action={action}
      hostName="Marie Curie"
      hostPicture={null}
      reusableTags={reusableTags}
    />,
  ).container;

  return { container };
}

// The chip row is the only `.flex.flex-wrap.gap-2` in the form, so its
// buttons, in DOM order, are exactly the chip list in render order.
function chipLabels(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>(".flex.flex-wrap.gap-2 button"),
  ).map((button) => button.textContent);
}

function stubAction(result: FormState = {}) {
  return vi.fn<ActionStub>(() => Promise.resolve(result));
}

// Every text field plus a cover file is `required`, so a submit only reaches
// the action once the whole form is filled, exactly like `RegisterForm`.
async function fillRequired(user: User) {
  await user.type(screen.getByLabelText("Titre de la propriété"), "Appartement cosy");
  await user.type(screen.getByLabelText("Description"), "Un bel appartement");
  await user.type(screen.getByLabelText("Code postal"), "13100");
  await user.type(screen.getByLabelText("Localisation"), "Aix-en-Provence");
  await user.type(screen.getByLabelText("Prix par nuit (€)"), "120");
  await user.upload(
    screen.getByLabelText("Image de couverture"),
    new File(["cover"], "cover.png", { type: "image/png" }),
  );
}

// jsdom's `required` validity check for `type="file"` does not recognize a
// file set via `userEvent.upload` (a jsdom limitation, not a browser one),
// which would otherwise block every submit below before the action runs.
// Dispatching the "submit" event directly, like `form.requestSubmit()`,
// skips that broken check without skipping the rest of the test.
function submit() {
  const form = screen.getByRole("button", { name: "Ajouter" }).closest("form");

  if (!form) {
    throw new Error("PropertyForm's submit button is not inside a <form>.");
  }

  fireEvent.submit(form);
}

describe("PropertyForm", () => {
  it("exposes every field by its accessible name", () => {
    renderForm(stubAction());

    expect(screen.getByLabelText("Titre de la propriété")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Code postal")).toBeInTheDocument();
    expect(screen.getByLabelText("Localisation")).toBeInTheDocument();
    expect(screen.getByLabelText("Prix par nuit (€)")).toBeInTheDocument();
    expect(screen.getByLabelText("Image de couverture")).toBeInTheDocument();
    expect(screen.getByLabelText("Image du logement")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ajouter une catégorie personnalisée"),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "WIFI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Parc" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeInTheDocument();
  });

  it("renders a field error and marks its input invalid", async () => {
    const user = userEvent.setup();
    renderForm(stubAction({ fieldErrors: { title: "Ce champ est requis." } }));

    await fillRequired(user);
    submit();

    // The input already exists before the submit, so `findBy` resolves on its
    // first poll and would assert before the action's re-render lands. Wait on
    // the attribute itself, not on the element.
    const title = screen.getByLabelText("Titre de la propriété");
    await vi.waitFor(() => expect(title).toHaveAttribute("aria-invalid", "true"));
    expect(title).toHaveAccessibleDescription("Ce champ est requis.");
  });

  it("refills the text inputs from the returned values", async () => {
    const user = userEvent.setup();
    renderForm(
      stubAction({
        values: {
          title: "Loft lumineux",
          description: "Refuit",
          postalCode: "75001",
          location: "Paris",
          price: "95",
        },
      }),
    );

    await fillRequired(user);
    submit();

    expect(await screen.findByDisplayValue("Loft lumineux")).toBeInTheDocument();
    expect(screen.getByLabelText("Code postal")).toHaveValue("75001");
    expect(screen.getByLabelText("Localisation")).toHaveValue("Paris");
    expect(screen.getByLabelText("Prix par nuit (€)")).toHaveValue(95);
  });

  it("renders reusable tags after the predefined chips, unpressed, and selects them on click", async () => {
    const user = userEvent.setup();
    const { container } = renderForm(stubAction(), ["Spa"]);
    const hiddenTags = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
      ).map((input) => input.value);

    const labels = chipLabels(container);
    expect(labels[labels.length - 1]).toBe("Spa");

    const spaChip = screen.getByRole("button", { name: "Spa" });
    expect(spaChip).toHaveAttribute("aria-pressed", "false");

    await user.click(spaChip);

    expect(spaChip).toHaveAttribute("aria-pressed", "true");
    expect(hiddenTags()).toEqual(["Spa"]);
  });

  it("renders a reusable tag equal to a predefined tag, in any casing, once", () => {
    renderForm(stubAction(), ["parc"]);

    expect(screen.getAllByRole("button", { name: "Parc" })).toHaveLength(1);
  });

  it("adds a new custom tag as a pressed chip at the end of the list, with its hidden input", async () => {
    const user = userEvent.setup();
    const { container } = renderForm(stubAction(), ["Spa"]);
    const hiddenTags = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
      ).map((input) => input.value);

    await user.type(
      screen.getByLabelText("Ajouter une catégorie personnalisée"),
      "Studio",
    );
    await user.click(screen.getByRole("button", { name: "+Ajouter un tag" }));

    const labels = chipLabels(container);
    expect(labels[labels.length - 1]).toBe("Studio");

    const chip = screen.getByRole("button", { name: "Studio" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(hiddenTags()).toEqual(["Studio"]);
  });

  it("deselecting a custom chip removes its hidden input but keeps the chip, unpressed", async () => {
    const user = userEvent.setup();
    const { container } = renderForm(stubAction());
    const hiddenTags = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
      ).map((input) => input.value);

    await user.type(
      screen.getByLabelText("Ajouter une catégorie personnalisée"),
      "Spa",
    );
    await user.click(screen.getByRole("button", { name: "+Ajouter un tag" }));

    const chip = screen.getByRole("button", { name: "Spa" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(hiddenTags()).toEqual(["Spa"]);

    await user.click(chip);

    expect(screen.getByRole("button", { name: "Spa" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(hiddenTags()).toEqual([]);
  });

  it("re-adding an existing tag with different casing creates no second chip and no second hidden input", async () => {
    const user = userEvent.setup();
    const { container } = renderForm(stubAction());
    const hiddenTags = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
      ).map((input) => input.value);
    const draft = () =>
      screen.getByLabelText("Ajouter une catégorie personnalisée");
    const addButton = () =>
      screen.getByRole("button", { name: "+Ajouter un tag" });

    await user.type(draft(), "Spa");
    await user.click(addButton());

    expect(hiddenTags()).toEqual(["Spa"]);

    await user.type(draft(), "spa");
    await user.click(addButton());

    expect(screen.getAllByRole("button", { name: "Spa" })).toHaveLength(1);
    expect(hiddenTags()).toEqual(["Spa"]);
  });

  it("renders the predefined chips and works with no reusableTags prop", async () => {
    const user = userEvent.setup();
    renderForm(stubAction());

    const parcChip = screen.getByRole("button", { name: "Parc" });
    expect(parcChip).toBeInTheDocument();

    await user.click(parcChip);

    expect(parcChip).toHaveAttribute("aria-pressed", "true");
  });

  it("adds a custom tag on Enter, ignores blanks, and does not submit the form", async () => {
    const user = userEvent.setup();
    const action = stubAction();
    const { container } = renderForm(action);
    const draft = () =>
      screen.getByLabelText("Ajouter une catégorie personnalisée");
    const hiddenTags = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
      ).map((input) => input.value);

    await user.type(draft(), "   {Enter}");

    expect(hiddenTags()).toEqual([]);

    await user.type(draft(), "  Spa  {Enter}");

    expect(hiddenTags()).toEqual(["Spa"]);
    expect(screen.getByRole("button", { name: "Spa" })).toBeInTheDocument();
    expect(draft()).toHaveValue("");
    // Enter inside the custom-tag input must never reach the page form.
    expect(action).not.toHaveBeenCalled();
  });

  it("submits the custom tag in the tags FormData", async () => {
    const user = userEvent.setup();
    const action = stubAction();
    renderForm(action);

    await user.click(screen.getByRole("button", { name: "Parc" }));
    await user.type(
      screen.getByLabelText("Ajouter une catégorie personnalisée"),
      "Spa{Enter}",
    );
    await fillRequired(user);
    submit();

    await vi.waitFor(() => expect(action).toHaveBeenCalled());
    expect(action.mock.calls[0][1].getAll("tags")).toEqual(["Parc", "Spa"]);
  });

  it("adds picture rows up to the cap, then hides the add control", async () => {
    const user = userEvent.setup();
    renderForm(stubAction());
    const addPicture = () =>
      screen.getByRole("button", { name: "+Ajouter une image" });

    for (let i = 1; i < MAX_PICTURES; i++) {
      await user.click(addPicture());
    }

    expect(screen.getAllByLabelText(/^Image du logement/)).toHaveLength(
      MAX_PICTURES,
    );
    expect(
      screen.queryByRole("button", { name: "+Ajouter une image" }),
    ).not.toBeInTheDocument();
  });

  it("removes an added picture row with its minus control", async () => {
    const user = userEvent.setup();
    renderForm(stubAction());
    const rows = () => screen.getAllByLabelText(/^Image du logement/);

    await user.click(screen.getByRole("button", { name: "+Ajouter une image" }));
    expect(rows()).toHaveLength(2);

    // Only the second row is droppable, so this name is unambiguous.
    await user.click(screen.getByRole("button", { name: "Retirer cette image" }));
    expect(rows()).toHaveLength(1);
  });

  it("shows a minus on a non-droppable field only once it holds a file, and clears it", async () => {
    const user = userEvent.setup();
    renderForm(stubAction());
    const clearCover = () =>
      screen.queryByRole("button", {
        name: "Retirer le fichier pour Image de couverture",
      });

    expect(clearCover()).not.toBeInTheDocument();

    await user.upload(
      screen.getByLabelText("Image de couverture"),
      new File(["cover"], "cover.png", { type: "image/png" }),
    );
    expect(screen.getByText("cover.png")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Retirer le fichier pour Image de couverture",
      }),
    );

    expect(screen.queryByText("cover.png")).not.toBeInTheDocument();
    expect(clearCover()).not.toBeInTheDocument();
  });

  it("renders the submit button here and disables it while pending", async () => {
    const user = userEvent.setup();
    let resolveAction: (result: FormState) => void = () => {};
    const action = vi.fn<ActionStub>(
      () =>
        new Promise<FormState>((resolve) => {
          resolveAction = resolve;
        }),
    );
    renderForm(action);

    await fillRequired(user);
    submit();

    const pendingButton = await screen.findByRole("button", {
      name: "Ajout en cours…",
    });
    expect(pendingButton).toBeDisabled();

    resolveAction({});
    expect(await screen.findByRole("button", { name: "Ajouter" })).toBeEnabled();
  });
});
