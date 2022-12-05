import { Router } from "express";
import {
  AuthenticatedUser,
  ForgotPassword,
  Login,
  Logout,
  Refresh,
  Register,
  ResetPassword,
  UpdatePassword,
} from "../controllers/auth";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import {
  GetUsers,
  CreateUser,
  DeleteUser,
  UpdateUser,
  GetUser,
} from "../controllers/user";
import { GetProducts } from "../controllers/product";

export const routes = (router: Router) => {
  router.post("/api/register", Register);
  router.post("/api/login", Login);
  router.get("/api/user", AuthMiddleware, AuthenticatedUser);

  // Optional route to use both access + refresh tokens:
  router.post("/api/refresh", Refresh);

  router.post("/api/logout", AuthMiddleware, Logout);
  router.put("/api/update", AuthMiddleware, UpdatePassword);

  // Forgot Password:
  router.post("/api/forgot", ForgotPassword);
  router.post("/api/reset", ResetPassword);

  router.get("/api/users", AuthMiddleware, GetUsers);
  router.post("/api/users", AuthMiddleware, CreateUser);
  router.get("/api/users/:id", AuthMiddleware, GetUser);
  router.put("/api/users/:id", AuthMiddleware, UpdateUser);
  router.delete("/api/users/:id", AuthMiddleware, DeleteUser);

  // Product pagination route:
  router.get("/api/products", GetProducts);
};
