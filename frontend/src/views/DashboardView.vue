
<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { authState, logoutSession } from "../services/authService";

const router = useRouter();
const cerrandoSesion = ref(false);
const errorLogout = ref("");

const usuario = computed(() => authState.user);

const nombreRol = computed(() => {
  const roles = {
    attendee: "Asistente",
    organizer: "Organizador",
    admin: "Administrador"
  };

  return roles[usuario.value?.role] || "Usuario";
});

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
  } catch (error) {
    errorLogout.value =
      "Ocurrió un error al cerrar la sesión.";
  } finally {
    cerrandoSesion.value = false;
  }
};
</script>


<template>
  <main class="dashboard-page">

    <!-- BARRA SUPERIOR -->
    <header class="navbar">
      <div class="navbar-content">
        <div class="logo">✦ EventHub</div>

        <div class="navbar-actions">
          <span class="navbar-user">
            {{ usuario?.name || "Usuario" }}
          </span>

          <button
            class="logout-button"
            type="button"
            :disabled="cerrandoSesion"
            @click="cerrarSesion"
          >
            {{ cerrandoSesion ? "Cerrando..." : "Cerrar sesión" }}
          </button>
        </div>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="dashboard-content">

      <!-- BIENVENIDA -->
      <section class="welcome-section">
        <span class="section-label">PANEL PRINCIPAL</span>

        <h1>
          ¡Bienvenido{{ usuario ? `, ${usuario.name}` : "" }}!
          🎉
        </h1>

        <p>
          Consulta la información de tu cuenta y disfruta
          de tu experiencia en EventHub.
        </p>
      </section>

      <!-- MENSAJE DE ERROR AL CERRAR SESIÓN -->
      <p
        v-if="errorLogout"
        class="logout-error"
        role="alert"
      >
        {{ errorLogout }}
      </p>

      <!-- TARJETAS DE INFORMACIÓN -->
      <section class="cards-grid">

        <!-- MI CUENTA -->
        <article class="info-card">
          <div class="card-icon">👤</div>
          <h2>Mi cuenta</h2>

          <div class="info-row">
            <span>Nombre</span>
            <strong>
              {{ usuario?.name || "No disponible" }}
            </strong>
          </div>

          <div class="info-row">
            <span>Correo electrónico</span>
            <strong>
              {{ usuario?.email || "No disponible" }}
            </strong>
          </div>
        </article>

        <!-- INFORMACIÓN DE ACCESO -->
        <article class="info-card">
          <div class="card-icon">🛡️</div>
          <h2>Información de acceso</h2>

          <div class="info-row">
            <span>Rol</span>
            <strong>{{ nombreRol }}</strong>
          </div>

          <div class="info-row">
            <span>Estado del correo</span>

            <strong
              :class="usuario?.isEmailVerified ? 'verified' : 'pending'"
            >
              {{
                usuario?.isEmailVerified
                  ? "✓ Verificado"
                  : "Pendiente de verificación"
              }}
            </strong>
          </div>
        </article>

      </section>

    </div>
  </main>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f3f6fc;
  font-family: Arial, sans-serif;
  color: #0f172a;
}

/* BARRA SUPERIOR */
.navbar {
  background: linear-gradient(110deg, #0f172a, #1e3a8a);
  padding: 22px 36px;
  color: white;
}

.navbar-content {
  max-width: 1250px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.logo {
  font-size: 30px;
  font-weight: 700;
  color: white;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.navbar-user {
  font-size: 16px;
  font-weight: 500;
}

.logout-button {
  padding: 12px 22px;
  background: #ffffff;
  color: #1e3a8a;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.logout-button:hover:not(:disabled) {
  background: #dbeafe;
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* CONTENIDO */
.dashboard-content {
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  padding: 60px 36px;
  box-sizing: border-box;
}

.welcome-section {
  margin-bottom: 42px;
}

.section-label {
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

.welcome-section h1 {
  font-size: clamp(30px, 3.5vw, 46px);
  color: #0f172a;
  margin: 18px 0;
}

.welcome-section p {
  font-size: 18px;
  line-height: 1.7;
  color: #64748b;
  max-width: 780px;
}

/* TARJETAS */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 34px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  min-width: 0;
}

.card-icon {
  font-size: 34px;
  margin-bottom: 18px;
}

.info-card h2 {
  font-size: 23px;
  margin: 0 0 26px;
  color: #0f172a;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 15px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  font-size: 15px;
  color: #64748b;
}

.info-row strong {
  font-size: 17px;
  color: #0f172a;
  overflow-wrap: anywhere;
}

.info-row .verified {
  color: #15803d;
}

.info-row .pending {
  color: #b45309;
}

/* PRÓXIMAMENTE */
.coming-soon {
  display: flex;
  align-items: center;
  gap: 25px;
  background: #e8f0ff;
  border: 1px solid #bfdbfe;
  border-radius: 18px;
  padding: 32px;
  margin-top: 32px;
}

.coming-icon {
  font-size: 42px;
}

.coming-soon h2 {
  color: #1e3a8a;
  font-size: 22px;
  margin: 0 0 10px;
}

.coming-soon p {
  color: #475569;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.logout-error {
  color: #b91c1c;
  background: #fef2f2;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 24px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .navbar {
    padding: 18px 20px;
  }

  .navbar-content {
    flex-wrap: wrap;
  }

  .logo {
    font-size: 25px;
  }

  .navbar-actions {
    gap: 12px;
  }

  .navbar-user {
    font-size: 14px;
  }

  .dashboard-content {
    padding: 38px 20px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 26px;
  }

  .coming-soon {
    align-items: flex-start;
    padding: 24px;
  }

  .welcome-section p {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .navbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .logout-button {
    padding: 10px 14px;
  }

  .coming-soon {
    flex-direction: column;
  }
}
</style>
