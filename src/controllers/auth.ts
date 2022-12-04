import { Request, Response, NextFunction } from "express";
import { RegisterValidation } from "../validation/register.validation";

export const Register = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;

  const { error } = RegisterValidation.validate(body);

  if (error) {
    return res.status(400).send(error.details);
  }

  if (body.password !== body.password_confirm) {
    return res.status(400).send({
      message: "Passwords do not match",
    });
  }

  res.send(req.body);
};
