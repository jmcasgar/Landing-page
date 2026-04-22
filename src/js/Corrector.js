(function () {

  const COMMANDS = new Map([
    ["highlight", (data) => {
      console.log("Highlight ejecutado:", data);
    }],
    ["format", (data) => {
      console.log("Format ejecutado:", data);
    }],
    ["mirrorSync", (data) => {
      console.log("Sync ejecutado:", data);
    }]
  ]);

  const TRUSTED_ORIGINS = new Set([window.location.origin]);
  function sanitizeText(value) {
    if (typeof value !== "string") return "";
    // Rechaza si contiene etiquetas HTML o scripts
    if (/<[^>]*>/i.test(value)) {
      console.warn("Valor rechazado por contener HTML:", value);
      return "";
    }
    return value;
  }


  function safeExecute(event) {
    try {
      const detail = event.detail;
      if (!detail || typeof detail !== "object" || Array.isArray(detail)) return;

      const { type, payload } = detail;
      if (!COMMANDS.has(type)) {
        console.warn("Comando no permitido:", type);
        return;
      }

      if (payload !== null && typeof payload === "object") {
        const dangerousKeys = ["__proto__", "constructor", "prototype"];
        if (dangerousKeys.some(k => Object.prototype.hasOwnProperty.call(payload, k))) {
          console.warn("Payload con clave peligrosa bloqueado.");
          return;
        }
      }

      COMMANDS.get(type)(payload);
    } catch (err) {
      console.error("Error ejecutando comando seguro:", err);
    }
  }

  function syncMirrors() {
    const mirrors = document.querySelectorAll(
      "lt-mirror:not([data-linked]), lt-highlighter:not([data-linked])"
    );

    const MAX_MIRRORS = 50;
    let count = 0;

    mirrors.forEach((el) => {
      if (count >= MAX_MIRRORS) {
        console.warn("Límite de mirrors alcanzado, elementos ignorados.");
        return;
      }

      const target = el.nextElementSibling;
      if (!target || !target.dataset.ltTmpId) return;

      el.dataset.linked = "true";
      count++;
      const SAFE_PROPS = ["value", "textContent", "innerText"];

      SAFE_PROPS.forEach((prop) => {
        try {
          Object.defineProperty(el, prop, {
            configurable: true,
            get: () => target[prop],
            set: (val) => {
              target[prop] = sanitizeText(val);
            }
          });
        } catch (e) {
          console.warn("No se pudo definir propiedad:", prop, e);
        }
      });
    });
  }

  document.addEventListener("lt-execute-code", safeExecute);
  document.addEventListener("lt-execute-link-properties", syncMirrors);
  document.addEventListener("lt-execute-destroy", function destroy() {
    document.removeEventListener("lt-execute-code", safeExecute);
    document.removeEventListener("lt-execute-link-properties", syncMirrors);
    document.removeEventListener("lt-execute-destroy", destroy);
  });

})();