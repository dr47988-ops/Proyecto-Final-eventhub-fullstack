
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
          Siempre hay una forma
          <span>de volver a conectar.</span>
        </h1>

        <p class="welcome-description">
          Recupera el acceso a tu cuenta y continúa
          disfrutando de todas las experiencias
          que EventHub tiene para ti.
        </p>

        <div class="welcome-features">
          <p>✦ Recupera tu acceso fácilmente</p>
          <p>✦ Mantén tu cuenta protegida</p>
          <p>✦ Continúa viviendo nuevas experiencias</p>
        </div>

      </div>
    </section>

    <!-- PANEL DERECHO -->
    <section class="recovery-panel">

      <div class="recovery-content">

        <div class="brand">
          <span class="brand-icon">✦</span>
          <h2>EventHub</h2>
        </div>

        <p class="subtitle">
          Tu próximo evento comienza aquí
        </p>

        <div class="recovery-icon">🔐</div>

        <h3>Recuperar contraseña</h3>

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

      </div>
    </section>

  </main>
</template>

<style scoped>
.recovery-page {
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

.recovery-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 65px;
  box-sizing: border-box;
}

.recovery-content {
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

.recovery-icon {
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

.recovery-button {
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

.recovery-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.recovery-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.back-text {
  text-align: center;
  margin-top: 30px;
  color: #64748b;
  font-size: 16px;
  line-height: 1.7;
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
  .recovery-page {
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

  .recovery-panel {
    padding: 50px 30px;
  }

  .recovery-content {
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

  .recovery-panel {
    padding: 36px 22px;
  }

  .brand h2 {
    font-size: 30px;
  }

  h3 {
    font-size: 25px;
  }

  input {
    font-size: 16px;
  }
}
</style>
