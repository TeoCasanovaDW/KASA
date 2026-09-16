import type { Preview } from "@storybook/nextjs-vite";
import { Inter } from "next/font/google";
import "../app/globals.css";

// Same font setup as app/layout.tsx, so `font-sans` resolves to Inter.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        className={`${inter.variable} font-sans bg-kasa-light-orange text-kasa-black p-6`}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
