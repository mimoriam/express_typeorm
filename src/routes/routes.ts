import { Router } from "express";
import {
  AuthenticatedUser,
  Login,
  Logout,
  Register,
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

export const routes = (router: Router) => {
  router.post("/api/register", Register);
  router.post("/api/login", Login);
  router.get("/api/user", AuthMiddleware, AuthenticatedUser);
  router.post("/api/logout", AuthMiddleware, Logout);
  router.put("/api/update", AuthMiddleware, UpdatePassword);

  router.get("/api/users", AuthMiddleware, GetUsers);
  router.post("/api/users", AuthMiddleware, CreateUser);
  router.get("/api/users/:id", AuthMiddleware, GetUser);
  router.put("/api/users/:id", AuthMiddleware, UpdateUser);
  router.delete("/api/users/:id", AuthMiddleware, DeleteUser);
};
