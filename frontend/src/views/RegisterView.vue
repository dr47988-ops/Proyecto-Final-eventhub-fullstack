
<script setup>
import { ref } from "vue";

const nombre = ref("");
const email = ref("");
const password = ref("");
const confirmarPassword = ref("");

const error = ref("");
const exito = ref("");
const cargando = ref(false);

const mostrarPassword = ref(false);
const mostrarConfirmacion = ref(false);

const registrarUsuario = async () => {
  error.value = "";
  exito.value = "";

  if (password.value !== confirmarPassword.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }

  if (password.value.length < 8) {
    error.value =
      "La contraseña debe tener al menos 8 caracteres.";
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

    if (!respuesta.ok) {
      error.value =
        datos.message ||
        datos.error ||
        "No se pudo completar el registro.";
      return;
    }

    exito.value = datos.verificationEmailSent
      ? "¡Cuenta creada correctamente! Revisa tu correo electrónico para verificar tu cuenta."
      : "Tu cuenta fue creada, pero no se pudo enviar el correo de verificación.";

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
          Grandes momentos
          <span>comienzan contigo.</span>
        </h1>

        <p class="welcome-description">
          Crea tu cuenta y forma parte de una comunidad
          donde cada evento es una nueva oportunidad
          para vivir experiencias inolvidables.
        </p>

        <div class="welcome-features">
          <p>✦ Descubre nuevas experiencias</p>
          <p>✦ Conecta con eventos de tu interés</p>
          <p>✦ Organiza tus actividades</p>
        </div>

      </div>
    </section>

    <!-- PANEL DERECHO -->
    <section class="register-panel">

      <div class="register-content">

        <div class="brand">
          <span class="brand-icon">✦</span>
          <h2>EventHub</h2>
        </div>

        <p class="subtitle">
          Tu próximo evento comienza aquí
        </p>

        <h3>Crear una cuenta</h3>

        <p class="description">
          Completa tus datos para unirte a EventHub.
        </p>

        <form @submit.prevent="registrarUsuario">

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
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                minlength="8"
                required
              />

              <button
                type="button"
                class="show-password"
                @click="mostrarPassword = !mostrarPassword"
              >
                {{ mostrarPassword ? "Ocultar" : "Mostrar" }}
              </button>
            </div>
          </div>

          <div class="field">
            <label for="confirmarPassword">
              Confirmar contraseña
            </label>

            <div class="password-wrapper">
              <input
                id="confirmarPassword"
                v-model="confirmarPassword"
                :type="mostrarConfirmacion ? 'text' : 'password'"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
                required
              />

              <button
                type="button"
                class="show-password"
                @click="mostrarConfirmacion = !mostrarConfirmacion"
              >
                {{ mostrarConfirmacion ? "Ocultar" : "Mostrar" }}
              </button>
            </div>
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
            class="register-button"
            :disabled="cargando"
          >
            {{ cargando ? "Registrando..." : "Crear cuenta" }}
          </button>

        </form>

        <p class="login-text">
          ¿Ya tienes una cuenta?

          <router-link to="/login">
            Inicia sesión
          </router-link>
        </p>

      </div>
    </section>

  </main>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

/* PANEL IZQUIERDO */

.welcome-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 70px;
  background: linear-gradient(
    145deg,
    #0f172a,
    #1e3a8a,
    #2563eb
  );
  color: white;
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

.register-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 55px 65px;
  box-sizing: border-box;
}

.register-content {
  width: 100%;
  max-width: 480px;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin: 12px 0 38px;
}

h3 {
  font-size: 30px;
  color: #0f172a;
  margin: 0 0 12px;
}

.description {
  font-size: 17px;
  color: #64748b;
  margin: 0 0 28px;
}

.field {
  margin-bottom: 22px;
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
  padding: 17px 18px;
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
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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

.register-button {
  width: 100%;
  padding: 18px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
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
  color: #64748b;
  font-size: 16px;
  margin-top: 30px;
}

.login-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.login-text a:hover {
  text-decoration: underline;
}

/* TABLETAS */

@media (max-width: 900px) {
  .register-page {
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

  .register-panel {
    padding: 50px 30px;
  }

  .register-content {
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

  .register-panel {
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
