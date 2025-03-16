import axios from "axios";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from "../bootstrap";
import { UserResponseWithToken } from "../controllers/auth/types";
import { UserResponse } from "../controllers/users/types";
import { checkReferralCode, generateString } from "./helpers";
const JWT_SECRET = process.env.SESSION_SECRET || ''

export interface FacebookToken {
  access_token: string;
}

export interface FacebookUserResult {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
}

export interface FacebookUser {
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  access_token: string;
  invitation?: string
}

export const getFacebookUser = async ({ access_token }: FacebookToken): Promise<FacebookUserResult> => {
  try {
    const res = await axios.get<any>(
      `https://graph.facebook.com/v15.0/me`,
      {
        params: {
          fields: 'id,name,email,first_name,last_name',
          access_token
        }
      }
    )
    return res.data
  } catch (error: any) {
    console.log(error, "Error fetching Facebook user");
    throw new Error(error.message);
  }
}

export const userLogOrCreateFromFacebook = async (facebookUser: FacebookUser): Promise<UserResponseWithToken> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: facebookUser.email
      },
    });
    if (user) {
      await prisma.user.update({
        where: {
          id: user?.id
        }, data: {
          facebookAccessToken: facebookUser.access_token
        }
      })
      const userWithRoles = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: { include: { permissions: true } }
            }
          },
        },
      });
      if (!userWithRoles) throw new Error('User not found');
      if (!user?.referalCode) {
        let code = generateString(5)

        while (await checkReferralCode(code)) {
          code = generateString(5)
        }
        await prisma.user.update({
          where: {
            id: user?.id
          },
          data: {
            referalCode: code
          }
        })
      }
      const token = jwt.sign({ id: userWithRoles.id, email: userWithRoles.email }, JWT_SECRET, { expiresIn: '168h' });
      const returnUser: UserResponse | null = userWithRoles
      if (returnUser?.password) delete returnUser.password;
      return { ...returnUser, token };
    } else {
      const role = await prisma.role.findFirst({
        where: {
          name: 'Client',
        },
      });

      if (!role) throw new Error('Default role not found');

      let code = generateString(5)

      while (await checkReferralCode(code)) {
        code = generateString(5)
      }

      const newUser = await prisma.user.create({
        data: {
          name: facebookUser.first_name || facebookUser.name || "",
          lastname: facebookUser.last_name || "",
          password: "",
          referalCode: code,
          email: facebookUser.email,
          phonenumber: "",
          address_city: "",
          address_country: "",
          address_line_1: "",
          address_line_2: "",
          address_postal_code: "",
          address_state: "",
          picture: null,
          description: null,
          facebookAccessToken: facebookUser.access_token
        }
      })

      await prisma.roleUser.create({
        data: {
          user_id: newUser.id,
          role_id: role.id,
        },
      });
      let storyInvited: any = null;
      if (facebookUser?.invitation) {
        const decoded = jwt.verify(facebookUser.invitation, JWT_SECRET) as JwtPayload & { story: string, email: string, type: string, role: string };
        const { story, email, type, role } = decoded;
        if (facebookUser.email !== email) throw new Error('Invalid invite token');
        storyInvited = await prisma.story.findFirst({
          where: {
            AND: [
              { id: Number(story) },
              {
                invitationCode: {
                  has: facebookUser.invitation
                }
              }
            ]
          }, include: {
            user: true
          }
        })
        // if (!storyInvited) throw new Error('Story not found');
        if(storyInvited){
        const roleGuest = await prisma.role.findFirst({
          where: {
            name: role,
          }
        })
        if (!roleGuest) throw new Error('Role not found');
        await prisma.roleUser.create({
          data: {
            user_id: newUser.id,
            role_id: roleGuest?.id,
            story_id: storyInvited?.id,
            user_type: type,
            validated: false
          }
        })

        if (
          storyInvited.inviteNoRegister &&
          typeof storyInvited.inviteNoRegister === "object" &&
          !Array.isArray(storyInvited.inviteNoRegister)
        ) {
          const inviteNoRegisterObject = storyInvited.inviteNoRegister;
          const updatedInvitationCodes = storyInvited.invitationCode.filter(
            (token:any) => token !== facebookUser.invitation
          );

          if (inviteNoRegisterObject[newUser.email]) {
            delete inviteNoRegisterObject[newUser.email];
          }

          await prisma.story.update({
            where: { id: Number(story) },
            data: {
              invitationCode: updatedInvitationCodes,
              inviteNoRegister: inviteNoRegisterObject,
            },
          });
        }
      }
    }
      const pendingNotificationStory = await prisma.story.findMany({
        where: {
          inviteNoRegister: {
            path: [newUser.email, "email"],
            equals: newUser.email,
          },
        },
      });
      if (pendingNotificationStory) {
        pendingNotificationStory.forEach(async (storyPending: any) => {
          const tokenValue =
            storyPending.inviteNoRegister &&
            storyPending.inviteNoRegister[newUser.email].token;
          const decoded = jwt.verify(tokenValue, JWT_SECRET) as JwtPayload & {
            story: string;
            email: string;
            type: string;
            role: string;
          };
          const { story, email, type, role } = decoded;
          if (newUser.email !== email) throw new Error("Invalid invite token");

          const storyNotification = await prisma.story.findFirst({
            where: {
              AND: [
                { id: Number(story) },
                {
                  invitationCode: {
                    has: tokenValue,
                  },
                },
              ],
            },
            include: {
              user: true,
            },
          });

          if (!storyNotification) throw new Error("Story not found");

          const roleGuest = await prisma.role.findFirst({
            where: {
              name: role,
            },
          });

          if (!roleGuest) throw new Error("Role not found");

          await prisma.roleUser.create({
            data: {
              user_id: newUser.id,
              role_id: roleGuest?.id,
              story_id: storyNotification?.id,
              user_type: type,
              // validated: true
            },
          });

          await prisma.notification.create({
            data: {
              user_id: newUser.id,
              message: `You have been invited to collaborate on the "${storyNotification?.user.name}" Story ${storyNotification?.title} in MEMVY as a ${roleGuest.name}.`,
              title: "Story Invitation Collaborator",
              avatar: storyNotification?.user?.picture,
              actions: {
                state: "UNREAD",
                type: "COLLABORATION",
                role: roleGuest.name,
                story_id: storyNotification?.url,
              },
            },
          });

          if (
            storyNotification.inviteNoRegister &&
            typeof storyNotification.inviteNoRegister === "object" &&
            !Array.isArray(storyNotification.inviteNoRegister)
          ) {
            const updatedInvitationCodes =
              storyNotification.invitationCode.filter(
                (token) => token !== tokenValue
              );
            const inviteNoRegisterObject = storyNotification.inviteNoRegister;

            if (inviteNoRegisterObject[newUser.email]) {
              delete inviteNoRegisterObject[newUser.email];
            }

            await prisma.story.update({
              where: { id: storyNotification?.id },
              data: {
                invitationCode: updatedInvitationCodes,
                inviteNoRegister: inviteNoRegisterObject,
              },
            });
          }
        });
      }

      const userWithRoles = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true
                }
              }
            }
          },
        },
      });
      if (!userWithRoles) throw new Error('User not found');
      const token = jwt.sign({ id: userWithRoles.id, email: userWithRoles.email }, JWT_SECRET, { expiresIn: '168h' });
      const returnUser: UserResponse | null = userWithRoles
      if (returnUser?.password) delete returnUser.password;
      return { ...returnUser, token };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}