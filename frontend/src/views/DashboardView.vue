
<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  authState,
  logoutSession
} from "../services/authService";

const router = useRouter();
const cerrandoSesion = ref(false);
const errorLogout = ref("");

const cerrarSesion = async () => {
  cerrandoSesion.value = true;
  errorLogout.value = "";

  try {
    const resultado = await logoutSession();

    if (resultado) {
      await router.replace("/login");
    } else {
      errorLogout.value =
        "No se pudo cerrar la sesión. Inténtalo nuevamente.";
    }
  } finally {
    cerrandoSesion.value = false;
  }
};

// Información del usuario autenticado
const usuario = computed(() => authState.user);

// Mostrar el rol en español
const nombreRol = computed(() => {
  const roles = {
    attendee: "Asistente",
    organizer: "Organizador",
    admin: "Administrador"
  };

  return roles[usuario.value?.role] || "Usuario";
});
</script>

<template>
  <main class="dashboard-page">
    <section class="dashboard-card">

      <div class="brand">
        <span class="brand-icon">✦</span>
        <h1>EventHub</h1>
      </div>

      <p class="subtitle">
        Tu próximo evento comienza aquí
      </p>

      <div class="welcome-icon">🎉</div>

      <h2>
        ¡Bienvenido{{ usuario ? `, ${usuario.name}` : "" }}!
      </h2>

      <p class="description">
        Has iniciado sesión en EventHub.
      </p>

      <div class="user-info">
        <div class="info-item">
          <span>Correo electrónico</span>
          <strong>{{ usuario?.email || "No disponible" }}</strong>
        </div>

        <div class="info-item">
          <span>Rol</span>
          <strong>{{ nombreRol }}</strong>
        </div>

        <div class="info-item">
          <span>Estado de la cuenta</span>
          <strong class="verified">
            {{ usuario?.isEmailVerified ? "✓ Verificada" : "Pendiente" }}
          </strong>
        </div>
      </div>

      <p class="footer-text">
        Próximamente podrás explorar eventos y gestionar
        tus actividades desde esta pantalla.
      </p>

      <p v-if="errorLogout" class="logout-error" role="alert">
  {{ errorLogout }}
</p>

<button
  type="button"
  class="logout-button"
  :disabled="cerrandoSesion"
  @click="cerrarSesion"
>
  {{ cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión" }}
</button>

    </section>
  </main>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  padding: 24px;
  font-family: Arial, sans-serif;
}

.dashboard-card {
  width: 100%;
  max-width: 500px;
  padding: 40px 34px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.22);
  text-align: center;
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
  color: #64748b;
  margin: 10px 0 30px;
}

.welcome-icon {
  font-size: 50px;
  margin-bottom: 15px;
}

h2 {
  color: #0f172a;
  margin-bottom: 10px;
}

.description {
  color: #64748b;
  margin-bottom: 28px;
}

.user-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item span {
  color: #64748b;
  font-size: 14px;
}

.info-item strong {
  color: #0f172a;
  font-size: 15px;
  overflow-wrap: anywhere;
}

.info-item .verified {
  color: #15803d;
}

.footer-text {
  margin-top: 26px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.logout-button {
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.logout-button:hover:not(:disabled) {
  background: #b91c1c;
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-error {
  color: #dc2626;
  font-size: 14px;
  margin-top: 16px;
}
</style>
