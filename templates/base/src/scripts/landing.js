function initializeLanding() {
  const root = document.querySelector("#hop-landing");

  if (!(root instanceof HTMLElement) || root.dataset.lrInitialized === "true") {
    return;
  }

  root.dataset.lrInitialized = "true";

  const status = root.querySelector("[data-lr-starter-status]");
  if (status) {
    status.textContent = "JavaScript подключён";
  }

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
      form.elements.namedItem(answer.name).value = answer.value;
    });
  };

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

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
        ready.querySelector("input")?.focus();
      }, 900);
    }
  });

  root.querySelectorAll("[data-lr-modal]").forEach((modal) => {
    modal.addEventListener("close", () => {
      trigger?.focus();
      trigger = null;
    });
  });

  root.querySelectorAll('form[data-lr-demo-form="true"]').forEach((form) => {
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeLanding, {
    once: true,
  });
} else {
  initializeLanding();
}
