import { Request, Response } from 'express';
import { Auth } from '../controllers'

const auth = new Auth();


export const loginRequest = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const response = await auth.loginUser({ email, password });
    return res.status(200).json({ result: response })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message })
  }
}



export const registerRequest = async (req: Request, res: Response) => {
  try {
    const response = await auth.registerUser(req?.body);
    return res.status(200).json({ result: response })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message })
  }
}

export const checkEmailExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ available: false, message: "Invalid email format." });
    }

    const existingUser = await auth.checkEmail(email);

    if (existingUser) {
      return res.status(200).json({ available: false, message: "Email already exists. Try another one." });
    }

    return res.status(200).json({ available: true, message: "Email is available!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const response = await auth.verifyCode({ email, code });
    return res.status(200).json({ result: response })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message })
  }
}