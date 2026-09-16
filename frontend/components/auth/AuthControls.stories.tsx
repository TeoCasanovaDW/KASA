import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AuthField from "@/components/auth/AuthField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";

// One file for the two shared auth form controls: AuthField is the meta
// component, AuthSubmitButton stories render their own component.
const meta = {
  title: "Auth/AuthControls",
  component: AuthField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex max-w-sm flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    id: "email",
    name: "email",
    label: "Adresse email",
    type: "email",
    autoComplete: "email",
  },
} satisfies Meta<typeof AuthField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Field: Story = {};

export const FieldWithError: Story = {
  args: { id: "email-error", error: "Adresse email invalide." },
};

export const FieldWithDefaultValue: Story = {
  args: { id: "email-filled", defaultValue: "nathalie@example.com" },
};

export const SubmitButtonIdle: Story = {
  render: () => (
    <AuthSubmitButton
      label="Se connecter"
      pendingLabel="Connexion…"
      pending={false}
    />
  ),
};

export const SubmitButtonPending: Story = {
  render: () => (
    <AuthSubmitButton label="Se connecter" pendingLabel="Connexion…" pending />
  ),
};
