import { describe, expect, it } from "vitest";
import {
  composeLocation,
  filterEquipments,
  normalizeTag,
  parsePrice,
  validateImageFile,
  validatePropertyForm,
} from "./property-form";

const emptyValues = {
  title: "",
  description: "",
  postalCode: "",
  location: "",
  price: "",
};

const validValues = {
  title: "Appartement cosy",
  description: "Un bel appartement.",
  postalCode: "13100",
  location: "Aix-en-Provence",
  price: "120",
};

describe("validatePropertyForm", () => {
  it("returns every required-field message at once when everything is blank", () => {
    const errors = validatePropertyForm(emptyValues, {
      hasCover: false,
      pictureCount: 0,
    });

    expect(errors).toEqual({
      title: "Ce champ est requis.",
      description: "Ce champ est requis.",
      postalCode: "Ce champ est requis.",
      location: "Ce champ est requis.",
      price: "Ce champ est requis.",
      cover: "Une image de couverture est requise.",
    });
  });

  it("accepts a 5-digit postal code", () => {
    const errors = validatePropertyForm(
      { ...validValues, postalCode: "13100" },
      { hasCover: true, pictureCount: 0 }
    );

    expect(errors.postalCode).toBeUndefined();
  });

  it("rejects a non-numeric postal code", () => {
    const errors = validatePropertyForm(
      { ...validValues, postalCode: "ABCDE" },
      { hasCover: true, pictureCount: 0 }
    );

    expect(errors.postalCode).toBe("Le code postal doit contenir 5 chiffres.");
  });

  it.each([
    ["0", "Le prix doit être un nombre supérieur à 0."],
    ["-1", "Le prix doit être un nombre supérieur à 0."],
    ["abc", "Le prix doit être un nombre supérieur à 0."],
    ["120.5", undefined],
  ])("price %s", (price, expected) => {
    const errors = validatePropertyForm(
      { ...validValues, price },
      { hasCover: true, pictureCount: 0 }
    );

    expect(errors.price).toBe(expected);
  });

  it("requires a cover image", () => {
    const errors = validatePropertyForm(validValues, {
      hasCover: false,
      pictureCount: 0,
    });

    expect(errors.cover).toBe("Une image de couverture est requise.");
  });

  it("accepts exactly the picture cap", () => {
    const errors = validatePropertyForm(validValues, {
      hasCover: true,
      pictureCount: 6,
    });

    expect(errors.pictures).toBeUndefined();
  });

  it("rejects one picture over the cap", () => {
    const errors = validatePropertyForm(validValues, {
      hasCover: true,
      pictureCount: 7,
    });

    expect(errors.pictures).toBe("6 images maximum.");
  });

  it("returns no errors for fully valid values", () => {
    const errors = validatePropertyForm(validValues, {
      hasCover: true,
      pictureCount: 1,
    });

    expect(errors).toEqual({});
  });
});

describe("validateImageFile", () => {
  it("accepts a 1 MB image/png", () => {
    expect(
      validateImageFile({ type: "image/png", size: 1024 * 1024 })
    ).toBeNull();
  });

  it("rejects a non-image type", () => {
    expect(
      validateImageFile({ type: "application/pdf", size: 1024 })
    ).toBe("Format non supporté. Utilisez une image.");
  });

  it("rejects an image over 10 MB", () => {
    expect(
      validateImageFile({ type: "image/png", size: 11 * 1024 * 1024 })
    ).toBe("L'image dépasse 10 Mo.");
  });
});

describe("filterEquipments", () => {
  it("keeps only known equipments, deduplicated, in EQUIPMENTS order", () => {
    expect(filterEquipments(["WIFI", "Piscine", "WIFI"])).toEqual(["WIFI"]);
  });

  it("preserves EQUIPMENTS order regardless of submission order", () => {
    expect(filterEquipments(["Parking", "WIFI"])).toEqual(["WIFI", "Parking"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterEquipments(["Piscine"])).toEqual([]);
  });
});

describe("composeLocation", () => {
  it("trims both parts and joins with one space", () => {
    expect(composeLocation("  13100 ", " Aix-en-Provence ")).toBe(
      "13100 Aix-en-Provence"
    );
  });
});

describe("parsePrice", () => {
  it.each([
    ["120", 120],
    ["120.5", 120.5],
    ["0", null],
    ["-1", null],
    ["abc", null],
    ["", null],
  ])("parsePrice(%s)", (raw, expected) => {
    expect(parsePrice(raw)).toBe(expected);
  });
});

describe("normalizeTag", () => {
  it("trims whitespace", () => {
    expect(normalizeTag("  Nature  ")).toBe("Nature");
  });
});
