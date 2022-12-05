import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ForgotPass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({
    unique: true,
  })
  token: string;
}
