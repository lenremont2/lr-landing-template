# Motion

Use motion where it gives interaction feedback, explains a change, or supports the composition in the brief. The page can be static.

- Keep the headline, primary action, and content usable on the first frame. A visitor can read and use the page while scripts load.
- Give buttons, links, and form controls immediate feedback. Keep keyboard focus visible and preserve the current state after a transition.
- Reuse the project's motion tokens. For movement or fading, use transform and opacity so motion does not shift the layout. Use short transitions for controls and avoid repeatedly animating content during scroll.
- Place enhancement transitions and any hidden starting states inside `@media (prefers-reduced-motion: no-preference)`. The reduced-motion layout shows the full content. A decorative loop can show its poster instead.
- Verify the affected motion on narrow and wide screens, with reduced motion enabled, and with keyboard interaction. Check that content is readable, focus remains visible, and motion leaves the layout stable.
