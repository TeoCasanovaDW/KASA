"use client";

// No server-only imports: stays renderable under Vitest.
import { useState } from "react";
import PlusIcon from "@/components/icons/PlusIcon";
import { PREDEFINED_TAGS, normalizeTag } from "@/lib/property-form";

function sameTag(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function isPredefined(tag: string) {
  return PREDEFINED_TAGS.some((predefined) => sameTag(predefined, tag));
}

function chipClassName(pressed: boolean) {
  return pressed
    ? "rounded-full bg-kasa-red px-4 py-2 text-sm text-kasa-white"
    : "rounded-full bg-kasa-gray-light px-4 py-2 text-sm text-kasa-black";
}

/**
 * Predefined chips plus custom tag creation. Selected tags render as hidden
 * `name="tags"` inputs so the action reads them with `formData.getAll("tags")`.
 */
export default function TagSelector() {
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  // Chips for everything the predefined row does not already show, in the
  // order it was added: without this a custom tag is only a hidden input, so
  // adding one looks like nothing happened and it can never be removed.
  const customTags = selected.filter((tag) => !isPredefined(tag));

  function toggleTag(tag: string) {
    setSelected((prev) =>
      prev.some((selectedTag) => sameTag(selectedTag, tag))
        ? prev.filter((selectedTag) => !sameTag(selectedTag, tag))
        : [...prev, tag]
    );
  }

  function addCustomTag() {
    const tag = normalizeTag(draft);

    if (!tag) {
      return;
    }

    setSelected((prev) =>
      prev.some((selectedTag) => sameTag(selectedTag, tag)) ? prev : [...prev, tag]
    );
    setDraft("");
  }

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // The custom-tag input is not a nested form: Enter here must add the tag,
    // not submit the page form.
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomTag();
    }
  }

  return (
    <div>
      <p className="block text-sm font-semibold text-kasa-black">Catégories</p>

      <div className="mt-1.5 flex flex-wrap gap-2">
        {PREDEFINED_TAGS.map((tag) => {
          const pressed = selected.some((selectedTag) => sameTag(selectedTag, tag));

          return (
            <button
              key={tag}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggleTag(tag)}
              className={chipClassName(pressed)}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <label htmlFor="custom-tag" className="block text-sm font-semibold text-kasa-black">
          Ajouter une catégorie personnalisée
        </label>

        <div className="mt-1.5 flex items-center gap-2">
          <input
            id="custom-tag"
            type="text"
            placeholder="Nouveau tag"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            className="h-10 min-w-0 flex-1 rounded-lg border border-kasa-gray-light px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
          />

          {/* Text kept as the accessible name (aria-label), icon-only
              visually, matching the red square buttons on the image
              inputs. */}
          <button
            type="button"
            onClick={addCustomTag}
            aria-label="+Ajouter un tag"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-kasa-red text-kasa-white transition-colors hover:bg-kasa-dark-orange"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {customTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed
              onClick={() => toggleTag(tag)}
              className={chipClassName(true)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {selected.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}
    </div>
  );
}
