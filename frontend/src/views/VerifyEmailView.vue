
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const cargando = ref(true);
const verificado = ref(false);
const mensaje = ref("");

const verificarCorreo = async () => {
  const token = route.query.token;

  if (typeof token !== "string" || !token) {
    mensaje.value = "El enlace de verificación no es válido.";
    cargando.value = false;
    return;
  }

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/verify-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      }
    );

    const datos = await respuesta.json();

    if (respuesta.ok) {
      verificado.value = true;
      mensaje.value = "Tu correo se verificó correctamente.";
    } else {
      mensaje.value =
        datos.message ||
        datos.error ||
        "El enlace es inválido o ha expirado.";
    }
  } catch (error) {
    mensaje.value =
      "No se pudo conectar con el servidor. Inténtalo nuevamente.";
  } finally {
    cargando.value = false;
  }
};

onMounted(verificarCorreo);
</script>


<template>
  <main class="verification-page">

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
          Tu próxima experiencia
          <span>está por comenzar.</span>
        </h1>

        <p class="welcome-description">
          Estamos a un paso de completar tu registro.
          Verifica tu correo electrónico para disfrutar
          de todo lo que EventHub tiene para ti.
        </p>

        <div class="welcome-features">
          <p>✦ Conecta con nuevas experiencias</p>
          <p>✦ Mantén tu cuenta segura</p>
          <p>✦ Descubre eventos increíbles</p>
        </div>

      </div>
    </section>

    <!-- PANEL DERECHO -->
    <section class="verification-panel">
      <div class="verification-content">

        <div class="brand">
          <span class="brand-icon">✦</span>
          <h2>EventHub</h2>
        </div>

        <p class="subtitle">
          Tu próximo evento comienza aquí
        </p>

        <!-- VERIFICANDO -->
        <div
          v-if="cargando"
          class="status-content"
          role="status"
          aria-live="polite"
        >
          <div class="status-icon">⏳</div>

          <h3>Verificando correo...</h3>

          <p class="description">
            Espera un momento mientras confirmamos tu cuenta.
          </p>

          <div class="loading-bar">
            <div class="loading-progress"></div>
          </div>
        </div>

        <!-- VERIFICACIÓN EXITOSA -->
        <div
          v-else-if="verificado"
          class="status-content"
          role="status"
        >
          <div class="status-icon">✅</div>

          <h3>¡Correo verificado!</h3>

          <p class="success-message">
            {{ mensaje }}
          </p>

          <p class="description">
            Tu cuenta está lista para comenzar
            a disfrutar de EventHub.
          </p>

          <router-link
            to="/login"
            class="action-button"
          >
            Iniciar sesión
          </router-link>
        </div>

        <!-- ERROR DE VERIFICACIÓN -->
        <div
          v-else
          class="status-content"
          role="alert"
        >
          <div class="status-icon">⚠️</div>

          <h3>No se pudo verificar</h3>

          <p class="error-message">
            {{ mensaje }}
          </p>

          <p class="description">
            Revisa el enlace de verificación
            que recibiste en tu correo electrónico.
          </p>

          <router-link
            to="/login"
            class="action-button"
          >
            Volver al inicio de sesión
          </router-link>
        </div>

      </div>
    </section>

  </main>
</template>


<style scoped>
.verification-page {
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

.verification-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 65px;
  box-sizing: border-box;
}

.verification-content {
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
  margin: 12px 0 55px;
}

/* ESTADOS DE VERIFICACIÓN */

.status-content {
  text-align: center;
}

.status-icon {
  font-size: 58px;
  margin-bottom: 24px;
}

h3 {
  color: #0f172a;
  font-size: 30px;
  margin: 0 0 18px;
}

.description {
  color: #64748b;
  font-size: 17px;
  line-height: 1.7;
  margin-bottom: 28px;
}

.success-message {
  color: #15803d;
  background: #f0fdf4;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 22px;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 22px;
}

.action-button {
  display: block;
  width: 100%;
  padding: 18px;
  box-sizing: border-box;
  background: #2563eb;
  color: white;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  font-size: 17px;
  font-weight: 700;
  transition: background 0.2s;
}

.action-button:hover {
  background: #1d4ed8;
}

/* ANIMACIÓN DE CARGA */

.loading-bar {
  width: 100%;
  height: 7px;
  background: #dbeafe;
  border-radius: 20px;
  overflow: hidden;
  margin-top: 30px;
}

.loading-progress {
  width: 40%;
  height: 100%;
  background: #2563eb;
  border-radius: 20px;
  animation: loading 1.5s ease-in-out infinite alternate;
}

@keyframes loading {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(150%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-progress {
    animation: none;
  }
}

/* TABLETAS */

@media (max-width: 900px) {
  .verification-page {
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

  .verification-panel {
    padding: 50px 30px;
  }

  .verification-content {
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

  .verification-panel {
    padding: 36px 22px;
  }

  .brand h2 {
    font-size: 30px;
  }

  h3 {
    font-size: 25px;
  }

  .description {
    font-size: 16px;
  }
}
</style>
