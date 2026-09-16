import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ImageInput from "@/components/property/ImageInput";

const meta = {
  title: "Property/ImageInput",
  component: ImageInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The selected-file (thumbnail preview) and error states depend on a real file input, so they are not staged as separate stories: pick an image, or a non-image or oversized file, in the canvas to reach them.",
      },
    },
  },
} satisfies Meta<typeof ImageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RequiredCover: Story = {
  args: {
    id: "cover",
    name: "cover",
    label: "Image de couverture",
    required: true,
  },
};

export const RemovableRow: Story = {
  args: {
    id: "picture-0",
    name: "pictures",
    label: "Image du logement",
    onRemove: () => {},
  },
};
