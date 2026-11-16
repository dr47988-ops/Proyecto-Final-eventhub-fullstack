
<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const token = computed(() =>
  typeof route.query.token === "string"
    ? route.query.token
    : ""
);

const password = ref("");
const confirmarPassword = ref("");
const mostrarPassword = ref(false);
const error = ref("");
const exito = ref("");
const cargando = ref(false);

const cambiarPassword = async () => {
  error.value = "";
  exito.value = "";

  if (!token.value) {
    error.value = "El enlace de recuperación no es válido.";
    return;
  }

  if (password.value.length < 8 || password.value.length > 72) {
    error.value = "La contraseña debe tener entre 8 y 72 caracteres.";
    return;
  }

  if (password.value !== confirmarPassword.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }

  cargando.value = true;

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token.value,
          password: password.value
        })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      error.value =
        datos.message ||
        datos.error ||
        "No se pudo cambiar la contraseña.";
      return;
    }

    exito.value = "Tu contraseña se cambió correctamente.";
    password.value = "";
    confirmarPassword.value = "";

  } catch (err) {
    error.value =
      "No se pudo conectar con el servidor.";
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <main class="reset-page">
    <section class="reset-card">

      <div class="brand">
        <span class="brand-icon">✦</span>
        <h1>EventHub</h1>
      </div>

      <p class="subtitle">
        Tu próximo evento comienza aquí
      </p>

      <h2>Crear nueva contraseña</h2>

      <p class="description">
        Ingresa y confirma tu nueva contraseña
        para recuperar el acceso a tu cuenta.
      </p>

      <p v-if="!token" class="error-message" role="alert">
        El enlace no contiene un token de recuperación válido.
      </p>

      <form
        v-else-if="!exito"
        @submit.prevent="cambiarPassword"
      >
        <div class="field">
          <label for="password">Nueva contraseña</label>

          <input
            id="password"
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            minlength="8"
            maxlength="72"
            required
          />
        </div>

        <div class="field">
          <label for="confirmar">
            Confirmar contraseña
          </label>

          <input
            id="confirmar"
            v-model="confirmarPassword"
            :type="mostrarPassword ? 'text' : 'password'"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            minlength="8"
            maxlength="72"
            required
          />
        </div>

        <label class="show-password">
          <input
            v-model="mostrarPassword"
            type="checkbox"
          />
          Mostrar contraseñas
        </label>

        <p v-if="error" class="error-message" role="alert">
          {{ error }}
        </p>

        <button
          type="submit"
          class="reset-button"
          :disabled="cargando"
        >
          {{
            cargando
              ? "Guardando..."
              : "Cambiar contraseña"
          }}
        </button>
      </form>

      <p v-if="exito" class="success-message" role="status">
        {{ exito }}
      </p>

      <p class="back-text">
        <router-link to="/login">
          Volver a iniciar sesión
        </router-link>
      </p>

    </section>
  </main>
</template>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  padding: 24px;
  font-family: Arial, sans-serif;
}

.reset-card {
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

.field label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.field input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 15px;
  box-sizing: border-box;
  background: white;
  color: #0f172a;
}

.field input:focus {
  outline: none;
  border-color: #2563eb;
}

.show-password {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  color: #334155;
  font-size: 14px;
  cursor: pointer;
}

.show-password input {
  accent-color: #2563eb;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  color: #15803d;
  background: #f0fdf4;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.reset-button {
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

.reset-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.reset-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.back-text {
  text-align: center;
  margin-top: 28px;
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
