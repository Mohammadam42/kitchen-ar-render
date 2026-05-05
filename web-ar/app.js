const viewer = document.querySelector("#kitchenViewer");
const scaleRange = document.querySelector("#scaleRange");
const scaleValue = document.querySelector("#scaleValue");
const rotateLeft = document.querySelector("#rotateLeft");
const rotateRight = document.querySelector("#rotateRight");
const resetView = document.querySelector("#resetView");
const installButton = document.querySelector("#installButton");
const arButton = document.querySelector("#arButton");
const httpsWarning = document.querySelector("#httpsWarning");
const toast = document.querySelector("#statusToast");

let rotationY = 0;
let installPrompt = null;
let toastTimer = 0;

const setToast = (message) => {
  if (!message) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.add("hidden"), 3200);
};

const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

if (!window.isSecureContext && !isLocalhost) {
  httpsWarning.classList.remove("hidden");
  setToast("عرض 3D يعمل هنا، لكن فتح الكاميرا للـ AR يحتاج رابط HTTPS");
}

arButton.addEventListener("click", () => {
  if (!window.isSecureContext && !isLocalhost) {
    setToast("الكاميرا لن تفتح من HTTP. افتح النسخة من رابط HTTPS");
  }
});

const applyTransform = () => {
  const scale = Number(scaleRange.value);
  scaleValue.value = `${scale.toFixed(2)}x`;
  viewer.scale = `${scale} ${scale} ${scale}`;
  viewer.orientation = `0deg ${rotationY}deg 0deg`;
};

scaleRange.addEventListener("input", applyTransform);
rotateLeft.addEventListener("click", () => {
  rotationY -= 15;
  applyTransform();
});
rotateRight.addEventListener("click", () => {
  rotationY += 15;
  applyTransform();
});
resetView.addEventListener("click", () => {
  rotationY = 0;
  scaleRange.value = "1";
  viewer.cameraOrbit = "-34deg 66deg 4.8m";
  viewer.fieldOfView = "28deg";
  applyTransform();
});

viewer.addEventListener("load", () => setToast("التصميم جاهز"));
viewer.addEventListener("error", () => setToast("تعذر تحميل ملف التصميم"));
viewer.addEventListener("ar-status", (event) => {
  if (event.detail.status === "failed") {
    setToast(
      window.isSecureContext
        ? "هذا الجهاز لا يدعم AR أو يحتاج Google Play Services for AR"
        : "الكاميرا تحتاج HTTPS. ارفع مجلد web-ar على Netlify أو GitHub Pages"
    );
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.classList.add("hidden");
});

applyTransform();
