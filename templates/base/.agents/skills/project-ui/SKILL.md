---
name: project-ui
description: Реализует секцию в принятом дизайне, исправляет адаптивность или проводит визуальное ревью. Выбирай для изменения компонента и проверки готового интерфейса в браузере.
---

# Project UI

## Implement

- Read [AGENTS.md](../../../AGENTS.md), the brief, the target route or component, and its closest reusable components and styles. Follow the supplied reference or the project's existing visual language. For a new direction or requested redesign, use [Taste](../design-taste-frontend/SKILL.md) first.
- Reuse existing Astro components, SCSS tokens and vanilla JavaScript entrypoints. For layout changes, follow the [scoped CSS and responsive layout rules](../../../docs/landing-kit/styles.md). Use verified content.
- Keep copy, visual hierarchy, and primary action clear. Avoid decorative gradients, excessive cards, glass effects, oversized headings, or motion unless they support the brief or established design.
- Preserve semantics, accessible names, keyboard interaction, visible focus, responsive layout, reduced motion, and the loading, empty, error, and disabled states the feature needs.

## Verify or review

- Run relevant existing project checks. Inspect the rendered UI at the widths in the brief. Use the viewport matrix for the scope of the task in [the workflow](../../../docs/landing-workflow.md). For a transfer, compare the source and result at the same widths. Verify the main action with the actual input method (for a link, Tab to visible focus and press Enter to reach its target).
- Check overflow, target sizes, focus, labels, image alternatives, component consistency, and required runtime states. For an implementation request, fix demonstrated defects within scope. For a review request, preserve the project files and report observations and suggested corrections.
- Review each changed photo next to the heading and copy. Check that its subject and crop answer a visitor's question in that block. For an image review, record why each changed photo was kept, moved, replaced or removed.
- Before editing a photo-led section, capture the entire section at the target mobile and desktop widths. After removing or replacing a photo, rework the section as a whole. Check its grid, alignment, spacing, visual hierarchy and the balance among comparable items. Capture the rebuilt section at the same widths and compare the images before accepting it. A section can use one shared visual or a consistent text-only layout when that supports its content.
- For external photos, check the original page and the applicable terms before editing or adding them. Use assets whose terms cover the intended commercial use and any planned adaptations. For photos adapted to the page, choose a crop, tone and framing that clarify the subject and fit the visual direction. Record the creator, original source, license and changes alongside the local asset. Follow required attribution and ShareAlike terms. If rights are unclear, choose another image or a separately created illustration.
- For a review, give observed issues and evidence in order of user impact. For an implementation, recheck affected behavior after fixes.
- In the handoff, record the viewport and observed outcome for each affected state, plus paths to screenshots when captured. When a visual comparison changes a design decision, update the existing design notes with the decision and evidence. State which rendered checks could not be performed.

For a Landing Kit quiz transfer, compare the Astro and WordPress invitation, question, channel, validation and contact form at 375 and 1440 px. Verify Escape, focus restoration and reopening before accepting the dialog.
