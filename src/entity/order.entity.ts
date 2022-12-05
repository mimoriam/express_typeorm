import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { CreateDateColumn } from "typeorm";

@Entity()
export class Order {
  @Column()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: string;

  // Typescript Entity Getters:
  get full_name(): string {
    return `${this.name}`;
  }

  get total(): number {
    // Do some calculation here:
    return 2 * 2;
  }
}
