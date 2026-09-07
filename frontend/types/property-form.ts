// Mirrors AuthFormState (lib/auth-actions.ts): `values` echoes the raw
// inputs back so a failed submit keeps the form filled.
export type PropertyFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

// The raw string inputs read from the form/FormData, before validation or
// parsing (price stays a string here; see `parsePrice`).
export type PropertyFormValues = {
  title: string;
  description: string;
  postalCode: string;
  location: string;
  price: string;
};
