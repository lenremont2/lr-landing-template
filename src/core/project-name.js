const PROJECT_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u;

const CYRILLIC_TO_LATIN = new Map(
  Object.entries({
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  }),
);

export function suggestProjectName(value = "") {
  const transliterated = [...value.toLowerCase()]
    .map((character) => CYRILLIC_TO_LATIN.get(character) ?? character)
    .join("");

  return (
    transliterated
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/gu, "")
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/-{2,}/gu, "-")
      .replace(/^-|-$/gu, "") || "lr-landing"
  );
}

export function validateProjectName(value) {
  if (typeof value !== "string" || !PROJECT_NAME_PATTERN.test(value)) {
    const suggestion = suggestProjectName(value);
    throw new Error(
      `Некорректное имя проекта. Используйте строчные латинские буквы, цифры и дефисы. Например: ${suggestion}`,
    );
  }

  return value;
}
