import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Role } from "./role.entity";
import { JoinColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @Column({
    default: "",
  })
  tfa_secret: string;
}
