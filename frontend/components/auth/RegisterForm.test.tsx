import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RegisterForm from "./RegisterForm";

// Structural copy of `AuthFormState`: the real type lives in a `"use server"`
// module, which cannot be imported under Vitest.
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

const CONSENT_LABEL = "J'accepte les conditions d'utilisation";

function renderForm(result: FormState = {}) {
  const action = vi.fn<ActionStub>(() => Promise.resolve(result));
  render(<RegisterForm action={action} />);

  return { action };
}

// Every text field plus the consent box is `required`, so a submit only
// reaches the action once the whole form is filled.
async function fill(user: User) {
  await user.type(screen.getByLabelText("Nom"), "Martin");
  await user.type(screen.getByLabelText("Prénom"), "Jean");
  await user.type(screen.getByLabelText("Adresse email"), "jean@martin.fr");
  await user.type(screen.getByLabelText("Mot de passe"), "secret123");
  await user.click(screen.getByRole("checkbox", { name: CONSENT_LABEL }));
}

function submit(user: User) {
  return user.click(screen.getByRole("button", { name: "S'inscrire" }));
}

describe("RegisterForm", () => {
  it("renders the four fields, both roles and the consent checkbox", () => {
    renderForm();

    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: "Client" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Propriétaire" })).not.toBeChecked();

    expect(
      screen.getByRole("checkbox", { name: CONSENT_LABEL }),
    ).toBeInTheDocument();
  });

  it("submits role=owner when Propriétaire is selected", async () => {
    const user = userEvent.setup();
    const { action } = renderForm();

    await fill(user);
    await user.click(screen.getByRole("radio", { name: "Propriétaire" }));
    await submit(user);

    expect(action).toHaveBeenCalledTimes(1);
    expect(action.mock.calls[0][1].get("role")).toBe("owner");
  });

  it("renders a field error against the email input", async () => {
    const user = userEvent.setup();
    renderForm({ fieldErrors: { email: "Cet email est déjà utilisé." } });

    await fill(user);
    await submit(user);

    const email = await screen.findByLabelText("Adresse email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Cet email est déjà utilisé.");
  });

  it("echoes the returned values back and never the password", async () => {
    const user = userEvent.setup();
    renderForm({
      values: {
        nom: "Dupont",
        prenom: "Marie",
        email: "m@d.fr",
        role: "owner",
      },
    });

    await fill(user);
    await submit(user);

    // Different from what was typed, so this only passes if the values came
    // back from the returned state.
    expect(await screen.findByDisplayValue("Dupont")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom")).toHaveValue("Dupont");
    expect(screen.getByLabelText("Prénom")).toHaveValue("Marie");
    expect(screen.getByLabelText("Adresse email")).toHaveValue("m@d.fr");
    expect(screen.getByRole("radio", { name: "Propriétaire" })).toBeChecked();

    expect(screen.getByLabelText("Mot de passe")).toHaveValue("");
  });
});
