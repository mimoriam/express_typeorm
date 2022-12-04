import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../src";
import { User } from "../src/entity/user.entity";
import { verify } from "jsonwebtoken";

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const jwt = req.cookies["token"];

    // Get payload from cookie since frontend can't see the cookie:
    const payload: any = verify(jwt, process.env.SECRET_KEY);

    if (!payload) {
      return res.status(401).send({
        message: "Unauthenticated!",
      });
    }

    const user = await userRepository.findOne({
      where: {
        id: payload.id,
      },
    });

    req["user"] = user;

    next();
  } catch (err) {
    return res.status(401).send({
      message: "Unauthenticated!",
    });
  }
};
