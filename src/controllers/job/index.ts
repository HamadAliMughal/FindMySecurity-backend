import { Body, Post, Put, Route, Tags, Get, Path } from "tsoa";
import { prisma } from "../../bootstrap";
import { parseISO } from "date-fns"; // You can use a library like date-fns for parsing and formatting

@Route("/api/securitycompany-ad")
@Tags("SecurityCompanyJobs")
export default class Jobs {


    @Post("/job-ad")
    public async createSecurityJobAd(
        @Body() req: any
    ): Promise<{ success: boolean; jobAd?: any; message?: string }> {
        const {
            companyId,
            jobTitle,
            jobType,
            industryCategory,
            region,
            postcode,
            salaryRate,
            salaryType,
            jobDescription,
            requiredExperience,
            requiredLicences,
            shiftAndHours,
            startDate,
            deadline,
        } = req.body;
    
        // Convert the dates to ISO-8601 format using parseISO (or any other method of conversion)
        const isoStartDate = startDate ? parseISO(startDate).toISOString() : null;
        const isoDeadline = deadline ? parseISO(deadline).toISOString() : null;
    
        const jobAd = await prisma.serviceAd.create({
            data: {
                companyId,
                jobTitle,
                jobType,
                industryCategory,
                region,
                postcode,
                salaryRate,
                salaryType,
                jobDescription,
                requiredExperience,
                requiredLicences,
                shiftAndHours,
                startDate: isoStartDate,
                deadline: isoDeadline,
            },
        });
    
        return { success: true, jobAd };
    }
    



    @Put("/{id}")
    public async updateSecurityJobAd(
        @Path() id: number,
        @Body() body: {
            jobTitle?: string;
            jobType?: string;
            industryCategory?: string;
            region?: string;
            postcode?: string;
            salaryRate?: number;
            salaryType?: string;
            jobDescription?: string;
            requiredExperience?: string;
            requiredLicences?: string;
            shiftAndHours?: string;
            startDate?: Date;
            deadline?: Date;
        }
    ): Promise<{ success: boolean; jobAd?: any }> {
        const existing = await prisma.serviceAd.findUnique({ where: { id } });
        if (!existing) {
            throw new Error("Job ad not found.");
        }

        const jobAd = await prisma.serviceAd.update({
            where: { id },
            data: {
                ...body,
            },
        });

        return { success: true, jobAd };
    }

    @Get("/all")
    public async getAllSecurityJobAds(): Promise<{ success: boolean; jobs: any[] }> {
        const jobs = await prisma.serviceAd.findMany({
            include: {
                company: true
            },
        });

        return { success: true, jobs };
    }


}
