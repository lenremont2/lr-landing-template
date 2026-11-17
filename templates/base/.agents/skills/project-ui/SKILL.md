---
name: project-ui
description: "Build, refine, or review the interface of a Lenremont Astro landing. Use for section and component implementation, responsive fixes, visual polish, keyboard behavior, and rendered verification. For a new visual identity use design-taste-frontend unless the user selects another direction."
---

# Project UI

Implement the requested UI in the existing Astro project and use its visual language.

## Choose the mode from project context

- An extension, new page, component, responsive fix or local polish in an existing
  site continues its established visual language. A missing design document does
  not override nearby components, tokens and rendered examples.
- Use [Taste](../design-taste-frontend/SKILL.md) for a new direction or explicitly requested redesign, then implement
  the chosen direction here. Do not turn "make it prettier" into a full redesign.
- For a supplied screenshot/mockup/URL to reproduce, follow that target and the
  chosen platform's workflow instead of generating alternative art direction.
- For a critique, report observed issues and their impact. A review alone does not request edits.

## Inspect the existing design

- Read project instructions, the target route/component, its closest reusable components, and the actual tokens and styles.
- Read the existing brief and design notes when relevant. For project constraints see [AGENTS.md](../../../AGENTS.md).
- Infer existing density, typography, spacing, radii, colors, iconography, and interaction patterns from the implementation. Preserve them for refinement; change the visual direction only when requested.
- Use real content and assets. Do not invent business claims, testimonials, component availability, or token names.

## Implement

- Search local components and patterns before adding code. Reuse existing primitives and semantic tokens; add only the missing part.
- Keep copy, visual hierarchy, and primary action clear. Avoid decorative gradients, excessive cards, glass effects, oversized headings, or motion unless they support the brief or established design.
- Use one Astro component per standalone section and the existing SCSS and vanilla JavaScript entrypoints. Start with the first content section and finish with the last, without a site header or footer.
- Preserve semantics, accessible names, keyboard interaction, visible focus, responsive layout, reduced motion, and the loading, empty, error, and disabled states the feature needs.
- Use the installed project tooling and local component library.

## Alternatives, only when requested

- Offer a small comparable set of directions that differ in meaningful aspects such as hierarchy, density, composition, navigation, or interaction; a color swap alone is not a different direction.
- Keep framework, required content, accessibility, and brand constraints fixed. Explain the intended effect and tradeoffs, then implement the selected direction.
- Record a durable choice in the project's existing design documentation when useful. Do not create another state/configuration system just for this workflow.

## Verify or review

- When reviewing templated styling, compare the composition, hierarchy and visual details with the brief and rendered page. Keep the approved identity.
- Run relevant existing project checks. Inspect the rendered UI at the widths in the brief. For a landing-page change with no specified widths, use 390 and 1440 px. For a transfer, compare the source and result at the same widths. Verify the main action with the actual input method (for a link, Tab to visible focus and press Enter to reach its target).
- Check overflow, target sizes, focus, labels, image alternatives, component consistency, and required runtime states. Fix demonstrated defects within the requested scope.
- For each photo, look at the image next to its heading and copy on the rendered page. State what the photo shows and what question it answers for the visitor in that block. Keep it when the subject and crop support that job. Otherwise remove it, move it to a suitable block, or replace it with a relevant asset. Check provenance and captions for external photos. Record the reason and disposition when the task includes an image review.
- Before editing a photo-led section, capture the entire section at the target mobile and desktop widths. After removing or replacing a photo, rework the section as a whole. Check its grid, alignment, spacing, visual hierarchy and the balance among comparable items. Capture the rebuilt section at the same widths and compare the images before accepting it. A section can use one shared visual or a consistent text-only layout when that supports its content.
- For external photos, check the original page and the applicable terms before editing or adding them. Use assets whose terms cover the intended commercial use and any planned adaptations. For photos adapted to the page, choose a crop, tone and framing that clarify the subject and fit the visual direction. Record the creator, original source, license and changes alongside the local asset. Follow required attribution and ShareAlike terms. If rights are unclear, choose another image or a separately created illustration.
- For a review, separate verified functional/accessibility defects, design-system inconsistencies, and subjective recommendations. Give exact file/line evidence where applicable and prioritize by user impact.
- Recheck affected behavior after fixes. Stop when acceptance criteria and relevant checks pass; do not start an unrelated redesign or indefinite polishing cycle.
- In the handoff, record the viewport and observed outcome for each affected state, plus paths to screenshots when captured. When a visual comparison changes a design decision, update the existing design notes with the decision and evidence. State which rendered checks could not be performed.
