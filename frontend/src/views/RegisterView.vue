
<script setup>
import { ref } from "vue";

const nombre = ref("");
const email = ref("");
const password = ref("");
const confirmarPassword = ref("");

const error = ref("");
const exito = ref("");
const cargando = ref(false);

const registrarUsuario = async () => {
  error.value = "";
  exito.value = "";

  // Validar que las contraseñas coincidan
  if (password.value !== confirmarPassword.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }

  // Validar longitud de contraseña
  if (password.value.length < 8) {
    error.value = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }

  cargando.value = true;

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nombre.value.trim(),
          email: email.value.trim(),
          password: password.value
        })
      }
    );

    const datos = await respuesta.json();

    // Mostrar errores enviados por el backend
    if (!respuesta.ok) {
      error.value =
        datos.message ||
        datos.error ||
        "No se pudo completar el registro.";
      return;
    }

    // Mostrar mensaje de registro exitoso
    exito.value = datos.verificationEmailSent
      ? "¡Cuenta creada correctamente! Revisa tu correo electrónico para verificar tu cuenta."
      : "Tu cuenta fue creada, pero no se pudo enviar el correo de verificación.";

    // Limpiar formulario
    nombre.value = "";
    email.value = "";
    password.value = "";
    confirmarPassword.value = "";

  } catch (err) {
    error.value =
      "No se pudo conectar con el servidor. Comprueba que el backend esté encendido.";
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <main class="register-page">
    <section class="register-card">

      <!-- Nombre de la aplicación -->
      <div class="brand">
        <span class="brand-icon">✦</span>
        <h1>EventHub</h1>
      </div>

      <p class="subtitle">
        Vive experiencias inolvidables
      </p>

      <h2>Crear una cuenta</h2>

      <p class="description">
        Completa tus datos para unirte a EventHub.
      </p>

      <!-- Formulario de registro -->
      <form @submit.prevent="registrarUsuario">

        <!-- Nombre -->
        <div class="field">
          <label for="nombre">Nombre completo</label>
          <input
            id="nombre"
            v-model="nombre"
            type="text"
            placeholder="Tu nombre completo"
            autocomplete="name"
            required
          />
        </div>

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
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <!-- Confirmar contraseña -->
        <div class="field">
          <label for="confirmarPassword">
            Confirmar contraseña
          </label>
          <input
            id="confirmarPassword"
            v-model="confirmarPassword"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            required
          />
        </div>

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

        <!-- Botón de registro -->
        <button
          type="submit"
          class="register-button"
          :disabled="cargando"
        >
          {{ cargando ? "Registrando..." : "Crear cuenta" }}
        </button>

      </form>

      <!-- Enlace al login -->
      <p class="login-text">
        ¿Ya tienes una cuenta?
        <router-link to="/login">
          Inicia sesión
        </router-link>
      </p>

    </section>
  </main>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  font-family: Arial, sans-serif;
}

.register-card {
  width: 100%;
  max-width: 440px;
  padding: 36px;
  background: white;
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
  margin: 10px 0 28px;
}

h2 {
  margin-bottom: 8px;
  color: #0f172a;
}

.description {
  color: #64748b;
  margin-bottom: 24px;
}

.field {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 15px;
  background: #ffffff;
  color: #0f172a;
}

input:focus {
  outline: none;
  border-color: #2563eb;
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.register-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.login-text {
  text-align: center;
  margin-top: 26px;
  color: #64748b;
}

.login-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}
</style>
