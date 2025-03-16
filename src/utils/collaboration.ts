import { prisma } from "../bootstrap";
import { sentEmailWithTemplate } from "./mail";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.SESSION_SECRET || "";

interface roleMapping {
  [key: string]: string;
}

const roleMap: roleMapping = {
  owner: "Story_Owner",
  collaborator: "Story_Collaborator",
  viewer: "Story_Viewer",
  
};

export const inviteRegisteredCollaborator = async (
  guest: any,
  storyOwner: any,
  story_id: number,
  guest_email: string,
  user_type: string,
  role_name: string
) => {
  const role = await prisma.role.findFirst({
    where: {
      name: roleMap[role_name] || role_name,
    },
  });
  if (!role) throw new Error("hey the role is undefined in the database, Role not found");
  const userWithRoleAssigned = await prisma.roleUser.findFirst({
    where: {
      user_id: guest.id,
      story_id: story_id,
    },
    include: {
      user: true,
      role: true,
    },
  });

  if (
    (userWithRoleAssigned && userWithRoleAssigned.role_id !== role.id) ||
    (userWithRoleAssigned && userWithRoleAssigned?.user_type !== user_type)
  ) {
    await prisma.roleUser.update({
      where: {
        id: userWithRoleAssigned.id,
      },
      data: {
        role_id: role.id,
        user_type: user_type,
        story_id: story_id,
      },
    });

    if (userWithRoleAssigned.validated) {
      await sentEmailWithTemplate(
        guest_email,
        "Role Change",
        "d-3a95aa677793472383e4c701dfaf6825",
        {
          storyOwner: storyOwner.name,
          newRole: `${user_type}${" "} ${role.name.replace("_", " ")}`,
        }
      );
    } else {
      const story = await prisma.story.findUnique({
        where: {
          id: story_id,
        },
      });
      const notifications = await prisma.notification.findFirst({
        where: {
          user_id: guest.id,
          AND: [
            {
              actions: {
                path: ["story_id"],
                equals: story?.url,
              },
            },
            {
              actions: {
                path: ["role"],
                equals: userWithRoleAssigned.role.name,
              },
            },
          ],
        },
      });
      if (notifications)
        await prisma.notification.delete({ where: { id: notifications.id } });
      const notificationInvite = await prisma.notification.create({
        data: {
          user_id: guest.id,
          message: `You have been invited to collaborate on the "${storyOwner.name}" Story ${story?.title} in MEMVY as a ${role_name}.`,
          title: "Story Invitation Collaborator",
          avatar: storyOwner.picture,
          actions: {
            state: "UNREAD",
            type: "COLLABORATION",
            role: role.name,
            story_id: story?.url,
          },
        },
      });

      const storyUrlBase64 = Buffer.from(story?.url || "").toString("base64");
      const guestEmailBase64 = Buffer.from(guest_email || "").toString(
        "base64"
      );
      const roleNameBase64 = Buffer.from(role.name || "").toString("base64");
      const notificationIdBase64 = Buffer.from(
        notificationInvite.id?.toString() || ""
      ).toString("base64");

      const link = `${process.env.CLIENT_URL}/app/login?story_id=${storyUrlBase64}&guest=${guestEmailBase64}&role=${roleNameBase64}&notification=${notificationIdBase64}`;

      await sentEmailWithTemplate(
        guest_email,
        "Collaboration Invitation",
        "d-b1ebdd4e8b154def9cb07aeeb12ede5b",
        {
          storyOwner: storyOwner.name,
          link: link,
          story: story?.title,
          image: `${process.env.CDN_URL}${story?.cover_image}`,
        }
      );
    }
  } else if (userWithRoleAssigned && userWithRoleAssigned.role_id === role.id) {
    if (!userWithRoleAssigned.validated) {
      const story = await prisma.story.findUnique({
        where: {
          id: story_id,
        },
      });
      const notifications = await prisma.notification.findFirst({
        where: {
          user_id: guest.id,
          AND: [
            {
              actions: {
                path: ["story_id"],
                equals: story?.url,
              },
            },
            {
              actions: {
                path: ["role"],
                equals: userWithRoleAssigned.role.name,
              },
            },
          ],
        },
      });
      const storyUrlBase64 = Buffer.from(story?.url || "").toString("base64");
      const guestEmailBase64 = Buffer.from(guest_email || "").toString(
        "base64"
      );
      const roleNameBase64 = Buffer.from(role.name || "").toString("base64");
      const notificationIdBase64 = Buffer.from(
        notifications ? notifications.id?.toString() : ""
      ).toString("base64");

      const link = `${process.env.CLIENT_URL}/app/login?story_id=${storyUrlBase64}&guest=${guestEmailBase64}&role=${roleNameBase64}&notification=${notificationIdBase64}`;

      await sentEmailWithTemplate(
        guest_email,
        "Collaboration Invitation",
        "d-b1ebdd4e8b154def9cb07aeeb12ede5b",
        {
          storyOwner: storyOwner.name,
          link: link,
          story: story?.title,
          image: `${process.env.CDN_URL}${story?.cover_image}`,
        }
      );
      return;
    }

    return userWithRoleAssigned.user.email;
  } else {
    await prisma.roleUser.create({
      data: {
        user_id: guest.id,
        role_id: role.id,
        story_id: story_id,
        user_type: user_type,
      },
    });
    const story = await prisma.story.findUnique({
      where: {
        id: story_id,
      },
    });
    const notificationInvite = await prisma.notification.create({
      data: {
        user_id: guest.id,
        message: `You have been invited to collaborate on the "${storyOwner.name}" Story ${story?.title} in MEMVY as a ${role_name}.`,
        title: "Story Invitation Collaborator",
        avatar: storyOwner.picture,
        actions: {
          state: "UNREAD",
          type: "COLLABORATION",
          role: role.name,
          story_id: story?.url,
        },
      },
    });
    const storyUrlBase64 = Buffer.from(story?.url || "").toString("base64");
    const guestEmailBase64 = Buffer.from(guest_email || "").toString("base64");
    const roleNameBase64 = Buffer.from(role.name || "").toString("base64");
    const notificationIdBase64 = Buffer.from(
      notificationInvite.id?.toString() || ""
    ).toString("base64");

    const link = `${process.env.CLIENT_URL}/app/login?story_id=${storyUrlBase64}&guest=${guestEmailBase64}&role=${roleNameBase64}&notification=${notificationIdBase64}`;

    await sentEmailWithTemplate(
      guest_email,
      "Collaboration Invitation",
      "d-b1ebdd4e8b154def9cb07aeeb12ede5b",
      {
        storyOwner: storyOwner.name,
        link: link,
        story: story?.title,
        image: `${process.env.CDN_URL}${story?.cover_image}`,
      }
    );
  }
};

export const inviteNewUser = async (
  guest_email: string,
  story_id: number,
  user_type: string,
  role_name: string,
  storyOwner: any
) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: story_id },
    });
    if (!story) throw new Error("Story not found");

    const role = await prisma.role.findFirst({
      where: { name: roleMap[role_name] || role_name },
    });
    if (!role) throw new Error("Role not found");

    const tokenInvitation = jwt.sign(
      { story: story_id, email: guest_email, role: role.name, type: user_type },
      JWT_SECRET
    );

    const noRegister = {
      [guest_email]: {
        email: guest_email,
        token: tokenInvitation,
        role: role.name,
        type: user_type,
      },
    };

    const existingInviteNoRegister =
      story.inviteNoRegister &&
      typeof story.inviteNoRegister === "object" &&
      !Array.isArray(story.inviteNoRegister)
        ? (story.inviteNoRegister as Record<string, any>)
        : {};

    const updatedInviteNoRegister = {
      ...existingInviteNoRegister,
      ...noRegister,
    };

    const updatedInvitationCodes = story.invitationCode
      ? [...story.invitationCode, tokenInvitation]
      : [tokenInvitation];

    const updateStory = await prisma.story.update({
      where: { id: story_id },
      data: {
        invitationCode: updatedInvitationCodes,
        inviteNoRegister: updatedInviteNoRegister,
      },
    });

    const link = generateLink(
      story,
      guest_email,
      role.name,
      user_type,
      tokenInvitation
    );

    await sendEmail(guest_email, link, story, storyOwner);
    return {
      story: updateStory,
    };
  } catch (error: any) {
    console.error("Error occurred in inviteNewUser:", error.message);
  }
};

const sendEmail = async (
  guest_email: string,
  link: string,
  story: any,
  storyOwner: any
) => {
  try {
    await sentEmailWithTemplate(
      guest_email,
      "Collaboration Invitation",
      "d-b1ebdd4e8b154def9cb07aeeb12ede5b",
      {
        storyOwner: storyOwner.name,
        link: link,
        story: story?.title,
        image: `${process.env.CDN_URL}${story?.cover_image}`,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
const generateLink = (
  story: any,
  guest_email: string,
  role_name: string,
  user_type: string,
  token: string
) => {
  const storyUrlBase64 = Buffer.from(story?.url || "").toString("base64");
  const guestEmailBase64 = Buffer.from(guest_email || "").toString("base64");
  const roleNameBase64 = Buffer.from(role_name || "").toString("base64");
  const userTypeBase64 = Buffer.from(user_type || "").toString("base64");

  return `${process.env.CLIENT_URL}/app/login?story_id=${storyUrlBase64}&guest=${guestEmailBase64}&role=${roleNameBase64}&type=${userTypeBase64}&invitation=${token}`;
};
