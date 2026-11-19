function initializeQuiz(root) {
  if (root.dataset.lrQuizInitialized) return;
  root.dataset.lrQuizInitialized = "true";
  let trigger = null;

  const findModal = (id) =>
    Array.from(root.querySelectorAll("[data-lr-modal]")).find(
      (modal) => modal.dataset.lrModal === id,
    );

  const openModal = (id, opener = null) => {
    const modal = findModal(id);
    if (!(modal instanceof HTMLDialogElement)) {
      return;
    }

    trigger = opener;
    if (!modal.open) {
      modal.showModal();
    }

    modal.querySelector("input, button, select, textarea")?.focus();
  };

  const closeModal = (modal) => {
    if (modal instanceof HTMLDialogElement && modal.open) {
      modal.close();
    }
  };

  const showQuizStep = (step) => {
    if (!(step instanceof HTMLElement)) {
      return;
    }

    step.hidden = false;
    step.querySelector("input")?.focus();
  };

  const showQuizMessage = (step) => {
    const message = step?.querySelector("[data-lr-quiz-message]");
    if (message) {
      message.textContent = "Выберите вариант, чтобы продолжить.";
    }
  };

  const saveQuizAnswers = (quiz) => {
    const form = quiz.querySelector("[data-hop-lead-form]");
    quiz.querySelectorAll("[data-lr-quiz-answer]:checked").forEach((answer) => {
      const field = form.elements.namedItem(
        answer.dataset.lrQuizAnswer || answer.name,
      );
      if (field) field.value = answer.value;
    });
  };

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (
      target.closest('[data-lr-component="lead-quiz-v1"]') !== root &&
      root.id !== "hop-landing"
    )
      return;
    if (
      root.id === "hop-landing" &&
      target.closest('[data-lr-component="lead-quiz-v1"]')
    )
      return;

    const opener = target.closest("[data-lr-modal-open]");
    if (opener instanceof HTMLElement) {
      openModal(opener.dataset.lrModalOpen, opener);
      return;
    }

    const closer = target.closest("[data-lr-modal-close]");
    if (closer) {
      closeModal(closer.closest("dialog"));
      return;
    }

    const next = target.closest("[data-lr-quiz-next]");
    if (next) {
      const currentStep = next.closest("[data-lr-quiz-step]");
      const answer = currentStep?.querySelector(
        "[data-lr-quiz-answer]:checked",
      );
      if (!answer) {
        showQuizMessage(currentStep);
        return;
      }

      currentStep.hidden = true;
      showQuizStep(currentStep.nextElementSibling);
      return;
    }

    if (target.closest("[data-lr-quiz-back]")) {
      const quiz = target.closest("[data-lr-quiz]");
      const steps = [...quiz.querySelectorAll("[data-lr-quiz-step]")];
      const panel = target.closest("[data-lr-quiz-step], [data-lr-quiz-ready]");
      const previous = steps[panel === steps[1] ? 0 : 1];
      panel.hidden = true;
      showQuizStep(previous);
      return;
    }

    const calculate = target.closest("[data-lr-quiz-calculate]");
    if (calculate) {
      const currentStep = calculate.closest("[data-lr-quiz-step]");
      const answer = currentStep?.querySelector(
        "[data-lr-quiz-answer]:checked",
      );
      if (!answer) {
        showQuizMessage(currentStep);
        return;
      }

      const quiz = calculate.closest("[data-lr-quiz]");
      if (!(quiz instanceof HTMLElement)) {
        return;
      }

      saveQuizAnswers(quiz);
      currentStep.hidden = true;
      const loading = quiz.querySelector("[data-lr-quiz-loading]");
      const ready = quiz.querySelector("[data-lr-quiz-ready]");
      loading.hidden = false;

      window.setTimeout(() => {
        loading.hidden = true;
        ready.hidden = false;
        if (ready.closest("dialog")?.open)
          ready.querySelector('input:not([type="hidden"])')?.focus();
      }, 900);
    }
  });

  root.querySelectorAll("[data-lr-modal]").forEach((modal) => {
    if (root.id === "hop-landing" && modal.closest("[data-lr-component]"))
      return;
    modal.addEventListener("close", () => {
      trigger?.focus();
      trigger = null;
    });
  });

  root.querySelectorAll('form[data-lr-demo-form="true"]').forEach((form) => {
    if (root.id === "hop-landing" && form.closest("[data-lr-component]"))
      return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector("[data-lr-form-message]");
      if (message) {
        message.textContent =
          "Локальная проверка пройдена. Заявка не отправлена.";
      }
    });
  });
}

function initialize() {
  document
    .querySelectorAll('[data-lr-component="lead-quiz-v1"]')
    .forEach(initializeQuiz);
  const landing = document.querySelector("#hop-landing");
  if (landing) initializeQuiz(landing);
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
else initialize();
