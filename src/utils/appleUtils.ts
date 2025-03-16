import axios from "axios";
import { prisma } from "../bootstrap";
import { UserResponseWithToken } from "../controllers/auth/types";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserResponse } from "../controllers/users/types";
import qs from "qs";
import { checkReferralCode, generateString } from "./helpers";
import fs from 'fs'

const JWT_SECRET = process.env.SESSION_SECRET || ''
// const PRIVATE_KEY = process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.replace(/\\n/g, '\n') || ''
const privateKey = fs.readFileSync('AuthKey_BZF7C745B2.p8');


interface AppleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  id_token: any;
}

interface AppleToken {
  access_token: string
  location?: string
}

interface AppleUser {
  name?: any,
  email?: string,
  family_name?: string,
  access_token: string,
  invitation?: string
}

export const getAppleUser = async ({
  access_token,
  location
}: AppleToken): Promise<AppleUserResult> => {
  try {

    const token = jwt.sign({
      iss: 'FT8ZP6W5L8',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      aud: 'https://appleid.apple.com',
      sub: 'memvy-app-prod-service'

    }, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: 'BZF7C745B2',
      }
    });
    const data = {
      grant_type: 'authorization_code',
      code: access_token,
      client_secret: token,
      client_id: 'memvy-app-prod-service',
      redirect_uri: location || 'https://memvy.com/app/login',
    }
    const res = await axios.post<AppleUserResult>(
      `https://appleid.apple.com/auth/token`, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }
    );
    if (!res) {
      throw new Error("Invalid access token");
    }

    return res.data;

  } catch (error: any) {
    console.log(error, "Error fetching Apple user");
    throw new Error(error.message);
  }
}

export const userLogOrCreateFromApple = async (appleUser: AppleUser): Promise<UserResponseWithToken> => {
  try {
    const { email, sub } = jwt.decode(appleUser.access_token) as JwtPayload;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || appleUser?.email },
          { appleuserAccessToken: sub },
        ]
      }
    });
    if (user) {
      await prisma.user.update({
        where: {
          id: user?.id
        }, data: {
          appleuserAccessToken: sub
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
          name: appleUser?.name?.firstName || "",
          lastname: appleUser?.name?.lastName || "",
          referalCode: code,
          password: "",
          email: email || appleUser?.email || "",
          phonenumber: "",
          address_city: "",
          address_country: "",
          address_line_1: "",
          address_line_2: "",
          address_postal_code: "",
          address_state: "",
          picture: null,
          description: null,
          appleuserAccessToken: sub,
        }
      })

      await prisma.roleUser.create({
        data: {
          user_id: newUser.id,
          role_id: role.id,
        },
      });
      let storyInvited: any = null;
      if (appleUser?.invitation) {
        const decoded = jwt.verify(appleUser.invitation, JWT_SECRET) as JwtPayload & { story: string, email: string, type: string, role: string };
        const { story, email, type, role } = decoded;
        if (newUser.email !== email) throw new Error('Invalid invite token');
        storyInvited = await prisma.story.findFirst({
          where: {
            AND: [
              { id: Number(story) },
              {
                invitationCode: {
                  has: appleUser?.invitation
                }
              }
            ]
          },
          include: {
            user: true
          }
        })
        // if (!storyInvited) throw new Error('Story not found');
        if (storyInvited) {
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
              (token: any) => token !== appleUser.invitation
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