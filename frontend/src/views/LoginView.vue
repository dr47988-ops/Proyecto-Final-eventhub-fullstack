
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { setSession } from "../services/authService";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const mostrarPassword = ref(false);

const error = ref("");
const exito = ref("");
const cargando = ref(false);
const cargandoGoogle = ref(false);

const googleButton = ref(null);
const googleDisponible = ref(false);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const obtenerDestino = () => {
  const redirect = route.query.redirect;

  return (
    typeof redirect === "string" &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.startsWith("/\\")
  )
    ? redirect
    : "/dashboard";
};

const completarSesion = async (datos) => {
  if (!datos.user || !datos.accessToken) {
    throw new Error("Respuesta de autenticación incompleta");
  }

  setSession(datos.user, datos.accessToken);
  password.value = "";

  await router.replace(obtenerDestino());
};

// ======================================
// INICIAR SESIÓN CON CORREO
// ======================================
const iniciarSesion = async () => {
  error.value = "";
  exito.value = "";

  if (!email.value.trim() || !password.value) {
    error.value = "Ingresa tu correo y contraseña.";
    return;
  }

  cargando.value = true;

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      error.value =
        datos.message ||
        datos.error ||
        "No se pudo iniciar sesión.";
      return;
    }

    await completarSesion(datos);
  } catch (err) {
    error.value =
      "No se pudo iniciar sesión. Comprueba que el backend esté encendido.";
  } finally {
    cargando.value = false;
  }
};

// ======================================
// INICIAR SESIÓN CON GOOGLE
// ======================================
const iniciarSesionGoogle = async (respuestaGoogle) => {
  error.value = "";
  exito.value = "";

  if (!respuestaGoogle?.credential) {
    error.value = "Google no devolvió una credencial válida.";
    return;
  }

  cargandoGoogle.value = true;

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/google",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          credential: respuestaGoogle.credential
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      error.value =
        datos.message ||
        "No se pudo iniciar sesión con Google.";
      return;
    }

    await completarSesion(datos);
  } catch (err) {
    error.value =
      "No se pudo conectar con el servidor para iniciar sesión con Google.";
  } finally {
    cargandoGoogle.value = false;
  }
};

// ======================================
// CARGAR GOOGLE IDENTITY SERVICES
// ======================================
const cargarGoogle = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(
      new Error("No se pudo cargar Google Identity Services")
    );

    document.head.appendChild(script);
  });
};

onMounted(async () => {
  if (!googleClientId) {
    error.value = "Falta configurar Google en el frontend.";
    return;
  }

  try {
    await cargarGoogle();
    await nextTick();

    if (!googleButton.value) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: iniciarSesionGoogle,
      ux_mode: "popup",
      auto_select: false
    });

    window.google.accounts.id.renderButton(
      googleButton.value,
      {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        width: 390
      }
    );

    googleDisponible.value = true;
  } catch (err) {
    console.error("Error al cargar Google:", err);
    error.value =
      "No se pudo cargar el inicio de sesión con Google.";
  }
});

onBeforeUnmount(() => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.cancel();
  }
});
</script>

<template>
  <main class="login-page">

    <!-- PANEL IZQUIERDO: BIENVENIDA -->
    <section class="welcome-panel">
      <div class="welcome-content">

        <div class="welcome-logo">
          ✦ EventHub
        </div>

        <p class="welcome-label">
          TU PLATAFORMA DE EVENTOS
        </p>

        <h1>
          Cada gran experiencia
          <span>comienza aquí.</span>
        </h1>

        <p class="welcome-description">
          Descubre eventos, conecta con nuevas experiencias
          y organiza momentos inolvidables en un solo lugar.
        </p>

        <div class="welcome-features">
          <p>✦ Descubre eventos de tu interés</p>
          <p>✦ Organiza y administra tus eventos</p>
          <p>✦ Vive experiencias únicas</p>
        </div>

      </div>
    </section>

    <!-- PANEL DERECHO: INICIO DE SESIÓN -->
    <section class="login-card">

      <div class="brand">
        <span class="brand-icon">✦</span>
        <h1>EventHub</h1>
      </div>

      <p class="subtitle">
        Tu próximo evento comienza aquí
      </p>

      <h2>Iniciar sesión</h2>

      <p class="description">
        Ingresa tus datos para continuar.
      </p>

      <form @submit.prevent="iniciarSesion">

        <div class="field">
          <label for="email">Correo electrónico</label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="correo@ejemplo.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="field">
          <label for="password">Contraseña</label>

          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              required
            />

            <button
              type="button"
              class="show-password"
              :aria-label="
                mostrarPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              "
              @click="mostrarPassword = !mostrarPassword"
            >
              {{ mostrarPassword ? "Ocultar" : "Mostrar" }}
            </button>
          </div>
        </div>

        <router-link
          to="/forgot-password"
          class="forgot"
        >
          ¿Olvidaste tu contraseña?
        </router-link>

        <p
          v-if="error"
          class="error-message"
          role="alert"
        >
          {{ error }}
        </p>

        <p
          v-if="exito"
          class="success-message"
          role="status"
        >
          {{ exito }}
        </p>

        <button
          type="submit"
          class="login-button"
          :disabled="cargando || cargandoGoogle"
        >
          {{ cargando ? "Iniciando sesión..." : "Iniciar sesión" }}
        </button>

      </form>

      <div class="separator">
        <span>o continúa con</span>
      </div>

      <div class="google-section">

        <div
          ref="googleButton"
          class="google-button"
        ></div>

        <p
          v-if="cargandoGoogle"
          class="google-loading"
        >
          Iniciando sesión con Google...
        </p>

        <p
          v-else-if="!googleDisponible && !error"
          class="google-loading"
        >
          Cargando Google...
        </p>

      </div>

      <p class="register-text">
        ¿Todavía no tienes cuenta?

        <router-link to="/register">
          Regístrate aquí
        </router-link>
      </p>

    </section>

  </main>
</template>




<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: Arial, sans-serif;
  background: #ffffff;
}

/* PANEL IZQUIERDO */
.welcome-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 70px;
  color: white;
  background: linear-gradient(145deg, #0f172a, #1e3a8a, #2563eb);
}

.welcome-content {
  width: 100%;
  max-width: 600px;
}

.welcome-logo {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 80px;
}

.welcome-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #bfdbfe;
  margin-bottom: 24px;
}

.welcome-content h1 {
  font-size: clamp(38px, 4vw, 64px);
  line-height: 1.15;
  margin: 0 0 28px;
}

.welcome-content h1 span {
  display: block;
  color: #93c5fd;
}

.welcome-description {
  font-size: 19px;
  line-height: 1.8;
  color: #dbeafe;
  max-width: 520px;
}

.welcome-features {
  margin-top: 45px;
}

.welcome-features p {
  font-size: 17px;
  margin-bottom: 20px;
  color: #eff6ff;
}

/* PANEL DERECHO */
.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 620px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 65px 75px;
  box-sizing: border-box;
  background: white;
}

.brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #2563eb;
}

.brand h1 {
  font-size: 36px;
  margin: 0;
}

.brand-icon {
  font-size: 34px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  font-size: 16px;
  margin: 12px 0 48px;
}

h2 {
  font-size: 30px;
  color: #0f172a;
  margin: 0 0 12px;
}

.description {
  font-size: 17px;
  color: #64748b;
  margin: 0 0 30px;
}

.field {
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

input {
  width: 100%;
  padding: 18px 20px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 17px;
  box-sizing: border-box;
  background: white;
  color: #0f172a;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 100px;
}

.show-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
}

.forgot {
  display: block;
  text-align: right;
  color: #2563eb;
  text-decoration: none;
  font-size: 15px;
  margin-bottom: 28px;
}

.forgot:hover {
  text-decoration: underline;
}

.error-message,
.success-message {
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  margin-bottom: 18px;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
}

.success-message {
  color: #15803d;
  background: #f0fdf4;
}

.login-button {
  width: 100%;
  padding: 19px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.login-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.login-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.separator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 30px 0 24px;
  color: #64748b;
  font-size: 14px;
}

.separator::before,
.separator::after {
  content: "";
  height: 1px;
  background: #cbd5e1;
  flex: 1;
}

.google-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 45px;
}

.google-button {
  display: flex;
  justify-content: center;
  width: 100%;
}

.google-loading {
  color: #64748b;
  font-size: 14px;
  margin-top: 12px;
}

.register-text {
  text-align: center;
  margin-top: 34px;
  color: #64748b;
  font-size: 16px;
}

.register-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.register-text a:hover {
  text-decoration: underline;
}

/* TABLETAS Y CELULARES */
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .welcome-panel {
    padding: 40px 28px;
  }

  .welcome-logo {
    margin-bottom: 24px;
  }

  .welcome-content h1 {
    font-size: 34px;
  }

  .welcome-description {
    font-size: 16px;
  }

  .welcome-features {
    display: none;
  }

  .login-card {
    min-height: auto;
    max-width: 600px;
    padding: 50px 30px;
  }
}

@media (max-width: 480px) {
  .welcome-panel {
    padding: 30px 22px;
  }

  .welcome-content h1 {
    font-size: 29px;
  }

  .login-card {
    padding: 36px 22px;
  }

  .brand h1 {
    font-size: 30px;
  }

  h2 {
    font-size: 25px;
  }
}
</style>
