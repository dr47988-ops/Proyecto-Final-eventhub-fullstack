
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

    <!-- PANEL IZQUIERDO -->
    <section class="welcome-panel">
      <div class="welcome-content">

        <div class="welcome-logo">
          ✦ EventHub
        </div>

        <p class="welcome-label">
          TU PLATAFORMA DE EVENTOS
        </p>

        <h1>
          Un nuevo comienzo
          <span>te está esperando.</span>
        </h1>

        <p class="welcome-description">
          Protege tu cuenta con una nueva contraseña
          y continúa descubriendo experiencias
          inolvidables en EventHub.
        </p>

        <div class="welcome-features">
          <p>✦ Protege tu información personal</p>
          <p>✦ Recupera el acceso a tu cuenta</p>
          <p>✦ Sigue disfrutando de tus eventos</p>
        </div>

      </div>
    </section>

    <!-- PANEL DERECHO -->
    <section class="reset-panel">
      <div class="reset-content">

        <div class="brand">
          <span class="brand-icon">✦</span>
          <h2>EventHub</h2>
        </div>

        <p class="subtitle">
          Tu próximo evento comienza aquí
        </p>

        <div class="reset-icon">🔐</div>

        <h3>Crear nueva contraseña</h3>

        <p class="description">
          Ingresa y confirma tu nueva contraseña
          para recuperar el acceso a tu cuenta.
        </p>

        <p
          v-if="!token"
          class="error-message"
          role="alert"
        >
          El enlace no contiene un token de recuperación válido.
        </p>

        <form
          v-else-if="!exito"
          @submit.prevent="cambiarPassword"
        >

          <div class="field">
            <label for="password">
              Nueva contraseña
            </label>

            <input
              id="password"
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="Entre 8 y 72 caracteres"
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

          <p
            v-if="error"
            class="error-message"
            role="alert"
          >
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

        <p
          v-if="exito"
          class="success-message"
          role="status"
        >
          {{ exito }}
        </p>

        <p class="back-text">
          <router-link to="/login">
            Volver a iniciar sesión
          </router-link>
        </p>

      </div>
    </section>

  </main>
</template>


<style scoped>
.reset-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

/* PANEL IZQUIERDO */

.welcome-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 70px;
  color: white;
  background: linear-gradient(
    145deg,
    #0f172a,
    #1e3a8a,
    #2563eb
  );
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
  color: #bfdbfe;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
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
  color: #dbeafe;
  font-size: 19px;
  line-height: 1.8;
  max-width: 520px;
}

.welcome-features {
  margin-top: 45px;
}

.welcome-features p {
  color: #eff6ff;
  font-size: 17px;
  margin-bottom: 20px;
}

/* PANEL DERECHO */

.reset-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 65px;
  box-sizing: border-box;
}

.reset-content {
  width: 100%;
  max-width: 480px;
}

.brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #2563eb;
}

.brand h2 {
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
  margin: 12px 0 45px;
}

.reset-icon {
  font-size: 42px;
  margin-bottom: 20px;
}

h3 {
  color: #0f172a;
  font-size: 30px;
  margin: 0 0 14px;
}

.description {
  color: #64748b;
  font-size: 17px;
  line-height: 1.7;
  margin-bottom: 30px;
}

.field {
  margin-bottom: 24px;
}

.field label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

.field input {
  width: 100%;
  padding: 18px 20px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 17px;
  box-sizing: border-box;
  background: white;
  color: #0f172a;
}

.field input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.show-password {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 26px;
  color: #334155;
  font-size: 15px;
  cursor: pointer;
}

.show-password input {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 18px;
}

.success-message {
  color: #15803d;
  background: #f0fdf4;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 18px;
}

.reset-button {
  width: 100%;
  padding: 18px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
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
  margin-top: 30px;
  font-size: 16px;
}

.back-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.back-text a:hover {
  text-decoration: underline;
}

/* TABLETAS */

@media (max-width: 900px) {
  .reset-page {
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

  .reset-panel {
    padding: 50px 30px;
  }

  .reset-content {
    max-width: 600px;
  }
}

/* CELULARES */

@media (max-width: 480px) {
  .welcome-panel {
    padding: 30px 22px;
  }

  .welcome-content h1 {
    font-size: 29px;
  }

  .reset-panel {
    padding: 36px 22px;
  }

  .brand h2 {
    font-size: 30px;
  }

  h3 {
    font-size: 25px;
  }

  .field input {
    font-size: 16px;
  }
}
</style>
