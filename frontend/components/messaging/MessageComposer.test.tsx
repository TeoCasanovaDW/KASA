import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MessageComposer from "./MessageComposer";

// Structural copy of `MessageFormState`: the real type lives in a `"use server"`
// module, which cannot be imported under Vitest.
type FormState = {
  error?: string;
  value?: string;
};

type ActionStub = (
  prevState: FormState,
  formData: FormData,
) => Promise<FormState>;

function renderComposer(result: FormState = {}, propertyId?: string) {
  const action = vi.fn<ActionStub>(() => Promise.resolve(result));
  render(
    <MessageComposer action={action} recipientId={4} propertyId={propertyId} />,
  );

  return { action };
}

const send = () => screen.getByRole("button", { name: "Envoyer" });
const field = () => screen.getByLabelText("Votre message");

describe("MessageComposer", () => {
  it("disables the send button while the field is empty", () => {
    renderComposer();

    expect(send()).toBeDisabled();
  });

  it("keeps the send button disabled for whitespace only", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(field(), "   ");

    expect(send()).toBeDisabled();
  });

  it("enables the send button once something is typed", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(field(), "Bonjour");

    expect(send()).toBeEnabled();
  });

  it("submits the typed body and the recipient", async () => {
    const user = userEvent.setup();
    const { action } = renderComposer();

    await user.type(field(), "Bonjour");
    await user.click(send());

    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1];
    expect(formData.get("body")).toBe("Bonjour");
    expect(formData.get("recipientId")).toBe("4");
  });

  it("submits the property when one is given", async () => {
    const user = userEvent.setup();
    const { action } = renderComposer({}, "abc");

    await user.type(field(), "Bonjour");
    await user.click(send());

    expect(action.mock.calls[0][1].get("propertyId")).toBe("abc");
  });

  it("submits no property when none is given", async () => {
    const user = userEvent.setup();
    const { action } = renderComposer();

    await user.type(field(), "Bonjour");
    await user.click(send());

    expect(action.mock.calls[0][1].get("propertyId")).toBeNull();
  });

  it("clears the field once the send succeeds", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(field(), "Bonjour");
    await user.click(send());

    expect(await screen.findByLabelText("Votre message")).toHaveValue("");
  });

  it("shows the error and keeps the typed text when the send fails", async () => {
    const user = userEvent.setup();
    renderComposer({ error: "L'envoi a échoué. Réessayez.", value: "Bonjour" });

    await user.type(field(), "Bonjour");
    await user.click(send());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "L'envoi a échoué. Réessayez.",
    );
    expect(field()).toHaveValue("Bonjour");
  });
});
