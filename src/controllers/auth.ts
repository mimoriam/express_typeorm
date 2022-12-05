import { Request, Response, NextFunction } from "express";
import { RegisterValidation } from "../validation/register.validation";
import { AppDataSource } from "../index";
import { User } from "../entity/user.entity";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import { randomBytes } from "crypto";
import { ForgotPass } from "../entity/forgot.entity";
import { createTransport } from "nodemailer";

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

  // const token = sign({ id: user.id }, process.env.SECRET_KEY);
  //
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   maxAge: 24 * 60 * 60 * 1000, // 1 day
  // });

  // Refactoring this for using access + refresh tokens:
  const accessToken = sign({ id: user.id }, process.env.ACCESS_SECRET || "", {
    expiresIn: "60s",
  });

  const refreshToken = sign({ id: user.id }, process.env.REFRESH_SECRET || "", {
    expiresIn: "1w",
  });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
  const { password, ...data } = req["user"];

  res.send(data);
};

export const Refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookie = req.cookies["refresh_token"];

    const payload: any = verify(cookie, process.env.REFRESH_SECRET || "");

    if (!payload) {
      return res.status(401).send({
        message: "Unauthenticated!",
      });
    }

    const accessToken = sign(
      { id: payload.id },
      process.env.ACCESS_SECRET || "",
      {
        expiresIn: "60s",
      }
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.send({
      message: "success",
    });
  } catch (err) {}
};

export const Logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.cookie("token", "", { maxAge: 0 });

  // Use with access & refresh tokens:
  // res.cookie("access_token", "", { maxAge: 0 });
  // res.cookie("refresh_token", "", { maxAge: 0 });

  res.send({
    message: "Logged out successfully",
  });
};

export const UpdatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = req["user"];

  await userRepository.update(user.id, {
    password: await bcrypt.hash(req.body.password, 10),
  });

  // Do not send the user with hashed password here (only done due to debugging)
  res.send(user);
};

export const ForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const token = Math.random().toString(20).substring(2, 12);

  const forgotPassRepository = AppDataSource.getRepository(ForgotPass);

  await forgotPassRepository.save({
    email,
    token,
  });

  const transporter = createTransport({
    host: "0.0.0.0",
    port: 1025,
  });

  const url = `http://localhost:3000/reset/${token}`;

  await transporter.sendMail({
    from: "from@example.com",
    to: email,
    subject: "Reset your password",
    html: `Click <a href="${url}">here</a> to reset your password!`,
  });

  res.send({
    message: "Email sent!",
  });
};

export const ResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const forgotPassRepository = AppDataSource.getRepository(ForgotPass);
  const { token, password } = req.body;

  const resetPassword = await forgotPassRepository.findOne({
    where: {
      token: token,
    },
  });

  if (!resetPassword) {
    return res.status(400).json({
      message: "Invalid Link!",
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: {
      email: resetPassword.email,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found!",
    });
  }

  await userRepository.update(user.id, {
    password: await bcrypt.hash(password, 10),
  });

  res.send({
    message: "Success",
  });
};
