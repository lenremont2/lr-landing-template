const phone = document.querySelector("#hop-landing [data-lr-phone]");
phone?.addEventListener("input", () => {
  phone.value = phone.value.replace(/\D/g, "").slice(0, 11);
});
