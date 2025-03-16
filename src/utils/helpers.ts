import { passwordRegex, emailRegex } from "./regex";
import { prisma } from "../bootstrap";
// Función para validar el formato del correo electrónico y la contraseña
function validateEmailAndPassword(email: string, password: string): void {
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }
  if (!passwordRegex.test(password)) {
    throw new Error(
      "Invalid password format. Password must be at least 8 characters long, contain at least one special character, one digit, one lowercase letter, and one uppercase letter."
    );
  }
}

// Función para verificar si un correo electrónico ya existe en otro usuario
async function checkExistingEmail(
  email: string,
  userId: number
): Promise<boolean> {
  const existingEmail = await prisma.user.findFirst({
    where: {
      email: email,
      NOT: {
        id: userId,
      },
    },
  });
  return !!existingEmail;
}

// Función para buscar un usuario por su ID
async function findUserById(userId: number) {
  const userToUpdate = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      referrals: true
    },
  });
  if (!userToUpdate) {
    throw new Error("User not found");
  }
  return userToUpdate;
}

// Función para buscar los roles de un usuario por su ID
async function findUserRoles(userId: number) {
  const roles = await prisma.roleUser.findMany({
    where: {
      user_id: userId,
    },
    include: {
      role: true,
    },
  });
  return roles;
}

// Función para verificar los permisos del usuario
function checkUserPermission(roles: any[]): boolean {
  return roles.some((userRole) => userRole.role.name === "Admin_User");
}

// Función para actualizar los roles de un usuario
async function updateRoles(roleName: string, userId: number, roles: any[]) {
  const sameRole = roles.some((userRole) => userRole.role.name === roleName);
  if (!sameRole) {
    const role = await prisma.role.findFirst({
      where: {
        name: roleName,
      },
    });
    if (!role) throw new Error("Default role not found");
    const rolesUsers = await prisma.roleUser.findMany({
      where: {
        user_id: userId,
        role_id: role.id
      }
    })
    for (const roleUser of rolesUsers) {
      await prisma.roleUser.update({
        where: {
          id: roleUser.id
        },
        data: {
          role_id: role.id
        }
      });
    }
  }
}

// Función para actualizar los datos de un usuario
async function updateUserAsync(userId: number, userData: any) {
  const updatedUserWithRoles = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...userData,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
  return updatedUserWithRoles;
}

async function updateRolesAsync(userId: number, rolesArray: any) {
  //si no cambiamos roles retornamos
  if (!rolesArray) return
  // Obtenemos los roles actuales del usuario
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!currentUser) throw Error("User not found");

  const currentRoleIds = currentUser.roles.map((role) => role.role_id);

  // Iteramos sobre los roles proporcionados desde el frontend
  for (const roleInfo of rolesArray) {
    const { role: roleData } = roleInfo;

    // Si el rol ya existe en la base de datos y tiene new en true, lo añadimos al usuario
    if (roleData.new && !currentRoleIds.includes(roleData.id)) {
      await prisma.roleUser.create({
        data: {
          role_id: roleData.id,
          user_id: userId,
        },
      });
    }

    // Si el rol no existe en la base de datos y tiene new en false, no hacemos nada
    // porque no se puede asignar un rol inexistente

    // Si el rol ya existe en la base de datos y tiene new en false,
    // pero no está asociado al usuario, lo añadimos
    if (!roleData.new && !currentRoleIds.includes(roleData.id)) {
      await prisma.roleUser.create({
        data: {
          role_id: roleData.id,
          user_id: userId,
        },
      });
    }
  }

  // Eliminamos los roles que ya no están presentes en el array de roles enviado desde el frontend
  const rolesToRemove = currentUser.roles.filter((role) => {
    const roleExistsInArray = rolesArray.some(
      (roleInfo: any) => roleInfo.role.id === role.role_id
    );
    return !roleExistsInArray;
  });

  for (const roleToRemove of rolesToRemove) {
    const rolesUserToRemove = await prisma.roleUser.findMany({
      where: {
        role_id: roleToRemove.role_id,
        user_id: userId
      }
    })
    for (const roleUserToRemove of rolesUserToRemove) {
      await prisma.roleUser.delete({
        where: {
          id: roleUserToRemove.id
        }
      })
    }
  }
}

export const generateString = (length: any) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export const checkReferralCode = async (code: string) => {
  const exitsCode = await prisma.referalsCode.findFirst({
    where: {
      referralCode: code
    }
  })

  const existUser = await prisma.user.findFirst({
    where: {
      referalCode: code
    }
  })

  return exitsCode || existUser
}
export {
  checkExistingEmail,
  checkUserPermission,
  findUserById,
  findUserRoles,
  updateRoles,
  updateUserAsync,
  validateEmailAndPassword,
  updateRolesAsync,
};
