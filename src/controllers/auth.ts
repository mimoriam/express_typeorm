import { Request, Response, NextFunction } from "express";
import { RegisterValidation } from "../validation/register.validation";
import { AppDataSource } from "../index";
import { User } from "../entity/user.entity";

export const Register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  const user = new User();

  user.first_name = body.first_name;
  user.last_name = body.last_name;
  user.email = body.email;
  user.password = body.password;

  await AppDataSource.manager.save(user);

  res.send(req.body);
};
