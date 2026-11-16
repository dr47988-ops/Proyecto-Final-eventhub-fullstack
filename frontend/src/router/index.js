
import { createRouter, createWebHistory } from "vue-router";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import VerifyEmailView from "../views/VerifyEmailView.vue";
import DashboardView from "../views/DashboardView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";

import {
  authState,
  refreshSession,
  isAuthenticated
} from "../services/authService";

// ======================================
// RUTAS DE EVENTHUB
// ======================================
const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "login",
    component: LoginView
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView
  },
  {
    path: "/verify-email",
    name: "verify-email",
    component: VerifyEmailView
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPasswordView
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: ResetPasswordView
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      requiresAuth: true,
      roles: ["attendee", "organizer", "admin"]
    }
  }
];

// ======================================
// CREAR ROUTER
// ======================================
const router = createRouter({
  history: createWebHistory(),
  routes
});

// ======================================
// VERIFICAR PERMISOS SEGÚN EL ROL
// ======================================
const tienePermiso = (to) => {
  const rolesPermitidos = to.meta.roles;

  // Si la ruta no limita roles, permitir acceso
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  // Verificar el rol del usuario autenticado
  return rolesPermitidos.includes(authState.user?.role);
};

// ======================================
// PROTEGER RUTAS PRIVADAS
// ======================================
router.beforeEach(async (to) => {

  // Permitir acceso a rutas públicas
  if (!to.meta.requiresAuth) {
    return true;
  }

  // Si existe una sesión en memoria
  if (isAuthenticated() && authState.user) {

    if (tienePermiso(to)) {
      return true;
    }

    // Evitar redirecciones infinitas
    if (to.name === "dashboard") {
      return false;
    }

    return { name: "dashboard" };
  }

  // Recuperar sesión mediante cookie HttpOnly
  try {
    const renewed = await refreshSession();

    if (renewed && authState.user) {

      // Comprobar permisos después de recuperar sesión
      if (tienePermiso(to)) {
        return true;
      }

      // Evitar redirecciones infinitas
      if (to.name === "dashboard") {
        return false;
      }

      return { name: "dashboard" };
    }

  } catch (error) {
    console.error(
      "Error al recuperar la sesión:",
      error
    );
  }

  // Si no hay sesión válida, regresar al login
  return {
    name: "login",
    query: {
      redirect: to.fullPath
    }
  };
});

export default router;
