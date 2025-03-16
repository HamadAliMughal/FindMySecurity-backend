// import { prisma } from "../../bootstrap";

// export  const checkPermissionUser = async  (userId: number, permission: string) => {


//     const roleUser = await prisma.roleUser.findFirst({
//       where: {
//         user_id: userId,
//       },include: {
//         role: {
//           include: {
//             permissions: {
//               where: {
//                 name: permission
//               }
//             }
//           }
//         }
//       }
//     })

//     if(!roleUser) return false
//     return true
// }
import { prisma } from "../../bootstrap";

export const checkPermissionUser = async (
  userId: number,
  permission: string
) => {

  const roleUsers = await prisma.roleUser.findMany({
    where: {
      user_id: userId,
    },
    include: {
      role: {
        include: {
          permissions: true, 
        },
      },
    },
  });

  if (!roleUsers || roleUsers.length === 0) {
    return false;
  }


  const userPermissions = new Set<string>();
  roleUsers.forEach((roleUser) => {
    roleUser.role.permissions.forEach((perm) => {
      userPermissions.add(perm.name);
    });
  });

  const hasPermission = userPermissions.has(permission);

  return hasPermission;
};
