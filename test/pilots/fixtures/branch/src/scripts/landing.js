const quiz = document.querySelector("#hop-landing [data-lead-root]");
if (quiz) {
  const steps = Array.from(quiz.querySelectorAll("[data-lr-step]"));
  const service = quiz.querySelector("[data-lr-service]");
  const symptom = quiz.querySelector("[data-lr-symptom]");
  const form = quiz.querySelector("form");
  let current = 0;
  quiz.addEventListener("click", (event) => {
    if (!event.target.matches("[data-lr-next], [data-lr-back]")) return;
    steps[current].hidden = true;
    current += event.target.matches("[data-lr-next]") ? 1 : -1;
    steps[current].hidden = false;
    quiz.querySelector("[data-lr-detail]").hidden = service.value !== "Экран";
    form.elements.service.value = service.value;
    form.elements.screen_symptom.value = symptom.value;
  });
}
