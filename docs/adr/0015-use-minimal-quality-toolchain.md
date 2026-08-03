---
status: accepted
---

# Использовать минимальный набор инструментов качества

Создаваемый проект включает `@astrojs/check`, TypeScript, Prettier и `prettier-plugin-astro` с командами `check`, `format`, `format:check` и `quality`, объединяющей проверку типов, форматирование и production build. ESLint, Stylelint, Husky, Vitest и Playwright не входят в первую версию: специфические ограничения Lenremont позднее проверит собственный валидатор, а преждевременный набор инструментов увеличит конфигурацию без сопоставимой пользы.
