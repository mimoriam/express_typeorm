import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../index";
import { User } from "../entity/user.entity";
import bcrypt from "bcryptjs";

export const GetUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);

  const users = await userRepository.find();

  // This is done, so we don't get hashed passwords:
  return res.send(
    users.map((user) => {
      const { password, ...data } = user;

      return data;
    })
  );
};

export const CreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);
  const { role_id, ...body } = req.body;

  const hashedPassword = await bcrypt.hash("1234", 10);

  const { password, ...user } = await userRepository.save({
    ...body,
    password: hashedPassword,
  });

  res.send(user);
};

export const GetUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);

  const { password, ...user } = await userRepository.findOne({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.send(user);
};

export const UpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);

  const { role_id, ...body } = req.body;

  await userRepository.update(req.params.id, body);

  const { password, ...data } = await userRepository.findOneBy({
    // Alternative method for WHERE clause used above:
    id: parseInt(req.params.id),
  });

  res.send(data);
};

export const DeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRepository = AppDataSource.getRepository(User);

  await userRepository.delete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
};
