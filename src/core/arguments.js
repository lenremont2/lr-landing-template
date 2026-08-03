import { parseArgs } from "node:util";

export function parseCreateArguments(arguments_) {
  const { positionals, values } = parseArgs({
    args: arguments_,
    allowPositionals: true,
    strict: true,
    options: {
      "no-install": {
        type: "boolean",
        default: false,
      },
      "no-git": {
        type: "boolean",
        default: false,
      },
    },
  });

  if (positionals.length > 1) {
    throw new Error("Укажите только одно имя проекта.");
  }

  return {
    projectName: positionals[0],
    install: !values["no-install"],
    git: !values["no-git"],
  };
}
