import { Request, Response } from 'express';
import { Profile } from '../controllers'

const profile = new Profile();


  export const updateIndividualProfileRequest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
  
      if (!id) {
        return res.status(400).json({ error: "Missing userId in query parameters." });
      }
  
      const response = await profile.updateIndividualProfile(
        parseInt(id), 
        req?.body
      );
  
      return res.status(200).json({ result: response });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message });
    }
  };
  
    