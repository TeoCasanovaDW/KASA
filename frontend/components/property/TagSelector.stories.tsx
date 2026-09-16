import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TagSelector from "@/components/property/TagSelector";

const meta = {
  title: "Property/TagSelector",
  component: TagSelector,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Chip selection and tags added through the input are session state only: they reset on reload and are persisted only when the surrounding property form is submitted.",
      },
    },
  },
} satisfies Meta<typeof TagSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PredefinedOnly: Story = {};

export const WithReusableTags: Story = {
  args: { reusableTags: ["Piscine", "Montagne", "Centre-ville"] },
};
