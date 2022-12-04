import { Router } from "express";
import { Register } from "../controllers/auth";

export const routes = (router: Router) => {
  router.post("/api/register", Register);
};
