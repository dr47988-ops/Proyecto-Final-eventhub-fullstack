
<script setup>
import { ref } from "vue";
import { setSession } from "../services/authService";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// Datos del formulario
const email = ref("");
const password = ref("");
const mostrarPassword = ref(false);

// Mensajes y estado
const error = ref("");
const exito = ref("");
const cargando = ref(false);

// Iniciar sesión
const iniciarSesion = async () => {
  error.value = "";
  exito.value = "";

  // Validar campos obligatorios
  if (!email.value.trim() || !password.value) {
    error.value = "Ingresa tu correo y contraseña.";
    return;
  }

  cargando.value = true;

  try {
    // Enviar credenciales al backend
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",

        // Permitir el envío y recepción de cookies
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

    // Verificar si ocurrió un error
    if (!respuesta.ok) {
      error.value =
        datos.message ||
        datos.error ||
        "No se pudo iniciar sesión.";
      return;
    }

   // Guardar la sesión del usuario en memoria
setSession(datos.user, datos.accessToken);

// Limpiar contraseña
password.value = "";

// Redirigir a la pantalla principal
const destino =
  typeof route.query.redirect === "string" &&
  route.query.redirect.startsWith("/") &&
  !route.query.redirect.startsWith("//")
    ? route.query.redirect
    : "/dashboard";

await router.replace(destino);

  } catch (err) {
    error.value =
      "No se pudo conectar con el servidor. Comprueba que el backend esté encendido.";
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <main class="login-page">
    <section class="login-card">

      <!-- Nombre de la aplicación -->
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

      <!-- Formulario -->
      <form @submit.prevent="iniciarSesion">

        <!-- Correo electrónico -->
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

        <!-- Contraseña -->
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
              :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="mostrarPassword = !mostrarPassword"
            >
              {{ mostrarPassword ? "Ocultar" : "Mostrar" }}
            </button>
          </div>
        </div>

        <!-- Recuperar contraseña -->
        <router-link
          to="/forgot-password"
          class="forgot"
        >
          ¿Olvidaste tu contraseña?
        </router-link>

        <!-- Mensaje de error -->
        <p
          v-if="error"
          class="error-message"
          role="alert"
        >
          {{ error }}
        </p>

        <!-- Mensaje de éxito -->
        <p
          v-if="exito"
          class="success-message"
          role="status"
        >
          {{ exito }}
        </p>

        <!-- Botón iniciar sesión -->
        <button
          type="submit"
          class="login-button"
          :disabled="cargando"
        >
          {{ cargando ? "Iniciando sesión..." : "Iniciar sesión" }}
        </button>

      </form>

      <!-- Enlace para registrarse -->
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
