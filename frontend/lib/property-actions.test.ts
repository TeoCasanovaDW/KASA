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
  deleteProperty: vi.fn(async () => undefined),
}));

const { revalidatePath, updateTag } = await import("next/cache");
const { redirect } = await import("next/navigation");
const { ApiError } = await import("./api-client");
const { getSessionUser } = await import("./session");
const { createProperty, deleteProperty } = await import("./properties-api");
const { createPropertyAction, deletePropertyAction } = await import(
  "./property-actions"
);

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

describe("deletePropertyAction", () => {
  it("deletes, refreshes the listings and lands on /mes-annonces", async () => {
    await expect(deletePropertyAction("abc123")).rejects.toBe(REDIRECT);

    expect(deleteProperty).toHaveBeenCalledWith("abc123");
    expect(updateTag).toHaveBeenCalledWith("properties");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/favoris");
    expect(redirect).toHaveBeenCalledWith("/mes-annonces");
  });

  it("treats a property that is already gone (404) as deleted", async () => {
    vi.mocked(deleteProperty).mockRejectedValueOnce(
      new ApiError("Property not found", 404)
    );

    await expect(deletePropertyAction("abc123")).rejects.toBe(REDIRECT);

    expect(redirect).toHaveBeenCalledWith("/mes-annonces");
  });

  it("explains a 403 without redirecting", async () => {
    vi.mocked(deleteProperty).mockRejectedValueOnce(
      new ApiError("only the property host can do this", 403)
    );

    await expect(deletePropertyAction("abc123")).resolves.toEqual({
      error: "Vous ne pouvez supprimer que vos propres annonces.",
    });
    expect(redirect).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("reports an unreachable service", async () => {
    vi.mocked(deleteProperty).mockRejectedValueOnce(
      new ApiError("fetch failed", 0)
    );

    await expect(deletePropertyAction("abc123")).resolves.toEqual({
      error: "Le service est indisponible. Réessayez plus tard.",
    });
  });

  it("reports any other failure generically", async () => {
    vi.mocked(deleteProperty).mockRejectedValueOnce(
      new ApiError("No fields to update", 400)
    );

    await expect(deletePropertyAction("abc123")).resolves.toEqual({
      error: "La suppression a échoué. Réessayez plus tard.",
    });
  });

  it("sends a visitor without a session to the login page", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce(null);

    await expect(deletePropertyAction("abc123")).rejects.toBe(REDIRECT);

    expect(redirect).toHaveBeenCalledWith("/connexion?next=%2Fmes-annonces");
    expect(deleteProperty).not.toHaveBeenCalled();
  });
});
