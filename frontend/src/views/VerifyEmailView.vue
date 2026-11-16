
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
    <section class="verification-card">
      <h1>✦ EventHub</h1>

      <template v-if="cargando">
        <div class="status-icon">⏳</div>
        <h2>Verificando correo...</h2>
        <p>Espera un momento mientras confirmamos tu cuenta.</p>
      </template>

      <template v-else-if="verificado">
        <div class="status-icon">✅</div>
        <h2>¡Correo verificado!</h2>
        <p>{{ mensaje }}</p>

        <router-link to="/login" class="action-button">
          Iniciar sesión
        </router-link>
      </template>

      <template v-else>
        <div class="status-icon">⚠️</div>
        <h2>No se pudo verificar</h2>
        <p>{{ mensaje }}</p>

        <router-link to="/login" class="action-button">
          Volver al inicio de sesión
        </router-link>
      </template>
    </section>
  </main>
</template>

<style scoped>
.verification-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  font-family: Arial, sans-serif;
}

.verification-card {
  width: 100%;
  max-width: 450px;
  padding: 45px 35px;
  background: #ffffff;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.22);
}

h1 {
  color: #2563eb;
  margin-bottom: 30px;
}

h2 {
  color: #0f172a;
  margin-bottom: 12px;
}

p {
  color: #64748b;
  line-height: 1.6;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 18px;
}

.action-button {
  display: inline-block;
  margin-top: 25px;
  padding: 13px 25px;
  background: #2563eb;
  color: white;
  border-radius: 9px;
  text-decoration: none;
  font-weight: 600;
}

.action-button:hover {
  background: #1d4ed8;
}
</style>
