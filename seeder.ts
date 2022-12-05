import { DataSource } from "typeorm";
import { User } from "./src/entity/user.entity";
import { Role } from "./src/entity/role.entity";
import { Permission } from "./src/entity/permission.entity";

// ts-node seeder.ts

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "node_admin",
  entities: [User, Role, Permission],
  logging: false,
  synchronize: true,
});

AppDataSource.initialize()
  .then(async () => {
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);

    const perms = [
      "view_users",
      "edit_users",
      "view_roles",
      "edit_roles",
      "view_products",
      "edit_products",
      "view_orders",
      "edit_orders",
    ];

    let permissions = [];

    for (let i = 0; i < perms.length; i++) {
      permissions.push(
        await permissionRepository.save({
          name: perms[i],
        })
      );
    }

    // Give admin all permissions
    await roleRepository.save({
      name: "admin",
      permissions,
    });

    // Editor doesn't need 1 permission (edit_roles):
    delete permissions[3];
    await roleRepository.save({
      name: "editor",
      permissions,
    });

    // Viewer doesn't need edit permissions:
    delete permissions[1];
    delete permissions[5];
    delete permissions[7];
    await roleRepository.save({
      name: "viewer",
      permissions,
    });

    process.exit(0);
  })
  .catch((error) => console.log(error));
