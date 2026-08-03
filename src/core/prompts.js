import { createInterface } from "node:readline/promises";

const NO_ANSWERS = new Set(["n", "no", "н", "нет"]);
const YES_ANSWERS = new Set(["", "y", "yes", "д", "да"]);

function parseBooleanAnswer(answer, question) {
  const normalized = answer.trim().toLowerCase();

  if (YES_ANSWERS.has(normalized)) {
    return true;
  }
  if (NO_ANSWERS.has(normalized)) {
    return false;
  }

  throw new Error(`Не удалось распознать ответ на вопрос «${question}».`);
}

export async function promptForCreateOptions({
  input = process.stdin,
  output = process.stdout,
} = {}) {
  const readline = createInterface({ input, output });

  try {
    const projectName = (await readline.question("Название проекта: ")).trim();
    const installQuestion = "Установить зависимости? [Да/нет]";
    const install = parseBooleanAnswer(
      await readline.question(`${installQuestion}: `),
      installQuestion,
    );
    const gitQuestion = "Инициализировать Git? [Да/нет]";
    const git = parseBooleanAnswer(
      await readline.question(`${gitQuestion}: `),
      gitQuestion,
    );

    return { projectName, install, git };
  } finally {
    readline.close();
  }
}
