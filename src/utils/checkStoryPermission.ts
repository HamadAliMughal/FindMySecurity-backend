import { prisma } from "../bootstrap"

export  const checkStoryPermission  = async (userId: number, storyId: number , permission: string) => {

      const roleUser = await prisma.roleUser.findFirst({
        where: {
          user_id: userId,
          story_id: storyId
        },include: {
          role: {
            include: {
              permissions: {
                where: {
                  name: permission
                }
              }
            }
          }
        }
      })
      if(!roleUser) return false
      return true
  }


