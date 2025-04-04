import { Body, Post, Put, Query, Route, Tags } from "tsoa";
import { prisma } from "../../bootstrap";
@Route("/api/profile")
@Tags("Profile")


export default class Profile {

    @Put("/individual")
    public async updateIndividualProfile(
      @Query("userId") userId: number,  // userId from query params
      @Body() req: { profileData: any; permissions?: any }
    ): Promise<{ success: boolean; message: string; user?: any }> {
      const { profileData, permissions } = req;
    
      const existingProfile = await prisma.individualProfessional.findUnique({
        where: { userId },
      });
    
      if (!existingProfile) {
        throw new Error("Profile not found.");
      }
    
      await prisma.individualProfessional.update({
        where: { userId },
        data: {
          profileData,
          permissions,
        },
      });
    
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          individualProfessional: true,
        },
      });
    
      if (!user) {
        throw new Error("User not found after profile update.");
      }
    
      const { password, ...userWithoutPassword } = user;
    
      return {
        success: true,
        message: "Profile updated successfully.",
        user: userWithoutPassword,
      };
    }
    
    

}