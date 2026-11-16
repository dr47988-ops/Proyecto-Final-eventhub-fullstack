
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
        width: 320
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
        <div ref="googleButton" class="google-button"></div>

        <p v-if="cargandoGoogle" class="google-loading">
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
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  padding: 24px;
  font-family: Arial, sans-serif;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 40px 34px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.22);
}

.brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #2563eb;
}

.brand h1 {
  margin: 0;
  font-size: 30px;
}

.brand-icon {
  font-size: 32px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin: 10px 0 30px;
}

h2 {
  color: #0f172a;
  margin-bottom: 8px;
}

.description {
  color: #64748b;
  margin-bottom: 26px;
}

.field {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 15px;
  box-sizing: border-box;
  background: #ffffff;
  color: #0f172a;
}

input:focus {
  outline: none;
  border-color: #2563eb;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 85px;
}

.show-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
}

.forgot {
  display: block;
  text-align: right;
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 24px;
}

.forgot:hover {
  text-decoration: underline;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.success-message {
  color: #15803d;
  background: #f0fdf4;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 16px;
  font-weight: 600;
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
  margin: 25px 0 20px;
  color: #64748b;
  font-size: 13px;
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
  font-size: 13px;
  color: #64748b;
  margin-top: 10px;
  text-align: center;
}

.register-text {
  text-align: center;
  margin-top: 28px;
  color: #64748b;
}

.register-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.register-text a:hover {
  text-decoration: underline;
}
</style>
