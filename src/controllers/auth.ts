import { Request, Response, NextFunction } from "express";
import { RegisterValidation } from "../validation/register.validation";
import { AppDataSource } from "../index";
import { User } from "../entity/user.entity";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { verify } from "jsonwebtoken";

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
  const userRepository = AppDataSource.getRepository(User);

  const salt = await bcrypt.genSalt(10);

  user.first_name = body.first_name;
  user.last_name = body.last_name;
  user.email = body.email;
  user.password = await bcrypt.hash(body.password, salt);

  const { password, ...data } = await userRepository.save(user);

  // Return everything but the password:
  res.send(data);
};

export const Login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    return res.status(400).send({
      message: "Invalid Credentials",
    });
  }

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).send({
      message: "Invalid Credentials",
    });
  }

  const token = sign({ id: user.id }, process.env.SECRET_KEY);

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  const { password, ...data } = user;

  res.send({
    message: "success",
  });
};

export const AuthenticatedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {password, ...data} = req["user"];

  res.send(data);
};

export const Logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.cookie("token", "", { maxAge: 0 });

  res.send({
    message: "Logged out successfully",
  });
};
