
import {
  createRouter,
  createWebHistory
} from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue")
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue")
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: () => import("../views/VerifyEmailView.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
