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

function renderForm(action: ActionStub) {
  const container = render(
    <PropertyForm action={action} hostName="Marie Curie" hostPicture={null} />,
  ).container;

  return { container };
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

  it("adds a hidden tags input for a toggled chip and a custom tag, without duplicating", async () => {
    const user = userEvent.setup();
    const { container } = renderForm(stubAction());
    const hiddenTags = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement>('input[name="tags"]'),
      ).map((input) => input.value);

    await user.click(screen.getByRole("button", { name: "Parc" }));
    await user.type(
      screen.getByLabelText("Ajouter une catégorie personnalisée"),
      "Spa",
    );
    await user.click(screen.getByRole("button", { name: "+Ajouter un tag" }));

    expect(hiddenTags()).toEqual(["Parc", "Spa"]);

    // Same custom tag again, case-insensitive: no second chip.
    await user.type(
      screen.getByLabelText("Ajouter une catégorie personnalisée"),
      "spa",
    );
    await user.click(screen.getByRole("button", { name: "+Ajouter un tag" }));

    expect(hiddenTags()).toEqual(["Parc", "Spa"]);
  });

  it("shows a custom tag as a pressed chip that toggles back off", async () => {
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

    // The regression: the tag reached the hidden inputs but had no chip, so
    // adding one looked like nothing happened and it could never be removed.
    const chip = screen.getByRole("button", { name: "Spa" });
    expect(chip).toHaveAttribute("aria-pressed", "true");

    await user.click(chip);

    expect(screen.queryByRole("button", { name: "Spa" })).not.toBeInTheDocument();
    expect(hiddenTags()).toEqual([]);
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
