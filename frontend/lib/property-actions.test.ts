import { beforeEach, describe, expect, it, vi } from "vitest";

// The action's Next.js surface: `redirect` signals by throwing in production,
// so the mock throws too and the test asserts on what was sent before it.
const REDIRECT = new Error("NEXT_REDIRECT");

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw REDIRECT;
  }),
}));

vi.mock("./session", () => ({
  getSessionUser: vi.fn(async () => ({
    id: 7,
    name: "Marie Dupont",
    email: "marie@dupont.fr",
    role: "owner",
  })),
}));

// Each upload returns its own URL, as the backend's unique filenames do.
vi.mock("./properties-api", () => ({
  uploadImage: vi.fn(async (file: File) => `/uploads/${file.name}`),
  createProperty: vi.fn(async () => ({ slug: "maison-bord-de-mer" })),
}));

const { createProperty } = await import("./properties-api");
const { createPropertyAction } = await import("./property-actions");

const image = (name: string) =>
  new File(["x"], name, { type: "image/jpeg" });

function buildFormData(pictures: string[]): FormData {
  const formData = new FormData();

  formData.set("title", "Maison bord de mer");
  formData.set("description", "Vue dégagée sur la baie.");
  formData.set("postalCode", "29200");
  formData.set("location", "Brest");
  formData.set("price", "120");
  formData.set("cover", image("cover.jpg"));

  for (const picture of pictures) {
    formData.append("pictures", image(picture));
  }

  return formData;
}

/** Runs the action and swallows the redirect it ends on. */
async function submit(formData: FormData) {
  await expect(createPropertyAction({}, formData)).rejects.toBe(REDIRECT);

  return vi.mocked(createProperty).mock.calls[0][0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createPropertyAction", () => {
  it("persists the cover and every selected picture", async () => {
    const payload = await submit(buildFormData(["salon.jpg", "cuisine.jpg"]));

    expect(payload.cover).toBe("/uploads/cover.jpg");
    // The cover leads the gallery, matching what the seeder stores.
    expect(payload.pictures).toEqual([
      "/uploads/cover.jpg",
      "/uploads/salon.jpg",
      "/uploads/cuisine.jpg",
    ]);
    expect(new Set(payload.pictures).size).toBe(payload.pictures.length);
  });

  it("sends the cover alone when no extra picture was selected", async () => {
    const payload = await submit(buildFormData([]));

    expect(payload.pictures).toEqual(["/uploads/cover.jpg"]);
  });
});
