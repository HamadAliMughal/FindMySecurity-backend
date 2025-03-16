import { Request, Response } from 'express';
import { Auth } from '../controllers'

const auth = new Auth();


// export const loginRequest = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const response = await auth.loginUser({ email, password });
//     return res.status(200).json({ result: response })
//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message })
//   }
// }



export const registerRequest = async (req: Request, res: Response) => {
  try {
    const response = await auth.registerUser(req?.body);
    return res.status(200).json({ result: response })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message })
  }
}