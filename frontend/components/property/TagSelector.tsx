"use client";

// No server-only imports: stays renderable under Vitest.
import { useState } from "react";
import PlusIcon from "@/components/icons/PlusIcon";
import { PREDEFINED_TAGS, dedupeTags, normalizeTag, sameTag } from "@/lib/property-form";

function chipClassName(pressed: boolean) {
  return pressed
    ? "rounded-full bg-kasa-red px-4 py-2 text-sm text-kasa-white"
    : "rounded-full bg-kasa-gray-light px-4 py-2 text-sm text-kasa-black";
}

/**
 * One chip list: predefined tags, then the owner's reusable tags, then tags
 * added in this session. Selected tags render as hidden `name="tags"` inputs
 * so the action reads them with `formData.getAll("tags")`.
 */
export default function TagSelector({
  reusableTags = [],
}: {
  reusableTags?: string[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [sessionTags, setSessionTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const chips = dedupeTags([...PREDEFINED_TAGS, ...reusableTags, ...sessionTags]);

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

    const existing = chips.find((chip) => sameTag(chip, tag));

    if (existing) {
      setSelected((prev) =>
        prev.some((selectedTag) => sameTag(selectedTag, existing))
          ? prev
          : [...prev, existing]
      );
    } else {
      setSessionTags((prev) => [...prev, tag]);
      setSelected((prev) => [...prev, tag]);
    }

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
        {chips.map((tag) => {
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

      {selected.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}
    </div>
  );
}
