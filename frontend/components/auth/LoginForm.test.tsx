import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

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

function renderForm(result: FormState = {}) {
  const action = vi.fn<ActionStub>(() => Promise.resolve(result));
  render(<LoginForm action={action} />);

  return { action };
}

// Both fields are `required`, so a submit only reaches the action once they
// are filled.
async function submit(user: User, email = "marie@dupont.fr") {
  await user.type(screen.getByLabelText("Adresse email"), email);
  await user.type(screen.getByLabelText("Mot de passe"), "secret123");
  await user.click(screen.getByRole("button", { name: "Se connecter" }));
}

describe("LoginForm", () => {
  it("renders the two fields and the submit button", () => {
    renderForm();

    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Se connecter" }),
    ).toBeInTheDocument();
  });

  it("shows the form-level error returned by the action", async () => {
    const user = userEvent.setup();
    renderForm({ formError: "Email ou mot de passe incorrect." });

    await submit(user);

    expect(
      await screen.findByText("Email ou mot de passe incorrect."),
    ).toBeInTheDocument();
  });

  it("marks the email field invalid and ties the message to it", async () => {
    const user = userEvent.setup();
    renderForm({ fieldErrors: { email: "Ce champ est requis." } });

    await submit(user);

    const email = await screen.findByLabelText("Adresse email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Ce champ est requis.");
  });

  it("calls the action once with the typed email", async () => {
    const user = userEvent.setup();
    const { action } = renderForm();

    await submit(user, "alice@example.com");

    expect(action).toHaveBeenCalledTimes(1);
    expect(action.mock.calls[0][1].get("email")).toBe("alice@example.com");
  });
});
