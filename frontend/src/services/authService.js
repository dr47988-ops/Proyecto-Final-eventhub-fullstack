
import { reactive } from "vue";

const API_URL = "http://localhost:3000/api/auth";

// Estado de autenticación
export const authState = reactive({
  user: null,
  accessToken: null,
  loading: false
});

// Guardar sesión después del login
export const setSession = (user, accessToken) => {
  authState.user = user;
  authState.accessToken = accessToken;
};

// Limpiar sesión local
export const clearSession = () => {
  authState.user = null;
  authState.accessToken = null;
};

// Consultar perfil autenticado
export const getProfile = async () => {
  if (!authState.accessToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authState.accessToken}`
      }
    });

    if (!response.ok) {
      console.error("Error al consultar perfil:", response.status);
      return false;
    }

    const data = await response.json();

    if (!data.user) {
      console.error("El servidor no devolvió un usuario");
      return false;
    }

    authState.user = data.user;

    console.log("EventHub: perfil recuperado correctamente");

    return true;
  } catch (error) {
    console.error("Error de conexión al consultar perfil:", error);
    return false;
  }
};

// Recuperar sesión mediante cookie HttpOnly
export const refreshSession = async () => {
  authState.loading = true;

  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      console.error("Error al renovar sesión:", response.status);
      clearSession();
      return false;
    }

    const data = await response.json();

    if (!data.accessToken) {
      clearSession();
      return false;
    }

    // Guardar nuevo access token
    authState.accessToken = data.accessToken;

    // Recuperar perfil antes de permitir navegación
    const profileLoaded = await getProfile();

    if (!profileLoaded) {
      clearSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al recuperar sesión:", error);
    clearSession();
    return false;
  } finally {
    authState.loading = false;
  }
};

// Cerrar sesión
export const logoutSession = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("No se pudo cerrar la sesión");
    }

    clearSession();
    return true;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
};

// Verificar autenticación en memoria
export const isAuthenticated = () => {
  return Boolean(authState.accessToken && authState.user);
};
