
<script setup>
import { ref } from "vue";

const email = ref("");
const error = ref("");
const exito = ref("");
const cargando = ref(false);

const recuperarPassword = async () => {
  error.value = "";
  exito.value = "";

  if (!email.value.trim()) {
    error.value = "Ingresa tu correo electrónico.";
    return;
  }

  cargando.value = true;

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.value.trim()
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      error.value =
        datos.message ||
        "No se pudo procesar la solicitud.";
      return;
    }

    exito.value =
      datos.message ||
      "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.";

    email.value = "";

  } catch (err) {
    error.value =
      "No se pudo conectar con el servidor. Inténtalo más tarde.";
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <main class="recovery-page">
    <section class="recovery-card">

      <div class="brand">
        <span class="brand-icon">✦</span>
        <h1>EventHub</h1>
      </div>

      <p class="subtitle">
        Tu próximo evento comienza aquí
      </p>

      <h2>Recuperar contraseña</h2>

      <p class="description">
        Ingresa tu correo electrónico y te enviaremos
        un enlace para crear una nueva contraseña.
      </p>

      <form @submit.prevent="recuperarPassword">

        <div class="field">
          <label for="email">
            Correo electrónico
          </label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="correo@ejemplo.com"
            autocomplete="email"
            required
          />
        </div>

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
          class="recovery-button"
          :disabled="cargando"
        >
          {{
            cargando
              ? "Enviando solicitud..."
              : "Enviar enlace de recuperación"
          }}
        </button>

      </form>

      <p class="back-text">
        ¿Recordaste tu contraseña?
        <router-link to="/login">
          Volver a iniciar sesión
        </router-link>
      </p>

    </section>
  </main>
</template>

<style scoped>
.recovery-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  padding: 24px;
  font-family: Arial, sans-serif;
}

.recovery-card {
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
  line-height: 1.6;
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

.recovery-button {
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

.recovery-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.recovery-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.back-text {
  text-align: center;
  margin-top: 28px;
  color: #64748b;
}

.back-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.back-text a:hover {
  text-decoration: underline;
}
</style>
