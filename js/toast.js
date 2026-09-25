const DURATION_MS = 2800;

const toast = document.getElementById("toast");
let hideTimer;

export function showToast(message, { error = false } = {}) {
  toast.textContent = message;
  toast.classList.toggle("error", error);
  toast.classList.add("show");

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove("show"), DURATION_MS);
}
