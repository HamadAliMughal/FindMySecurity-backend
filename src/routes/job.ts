import { Request, Response } from 'express';
import { Jobs } from '../controllers'

const job = new Jobs();
export const createSecurityJobAdRequest = async (req: Request, res: Response) => {
    try {
        const response = await job.createSecurityJobAd(req);
        return res.status(200).json({ result: response });
    } catch (error: any) {
        return res.status(500).json({ error: error?.message });
    }
};

export const getAllSecurityJobAdsRequest = async (req: Request, res: Response) => {
    try {
        const response = await job.getAllSecurityJobAds();
        return res.status(200).json({ result: response });
    } catch (error: any) {
        // Handle errors appropriately
        return res.status(500).json({ error: error?.message });
    }
};