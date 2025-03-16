import { Request, Response } from 'express';
import { Users } from '../controllers'

const users = new Users();

export const createRequest = async (req: Request, res: Response) => {
  try {
    const response = await users.createUser(req.body)
    return res.status(200).json({ result: response })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message })
  }
}

// export const deleteRequest = async (req: Request, res: Response) => {
//   try {
//     const response = await users.deleteUser(Number(req?.params?.id))
//     return res.status(200).json({ result: response })
//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message })
//   }
// }

// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const response = await users.getAllUsers()
//     return res.status(200).json({ result: response })
//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message })
//   }
// }

// export const RefreshUser = async (req: Request, res: Response) => {
//   try {
//     const request: any = req
//     const response = await users.refresh(request?.user?.id)
//     return res.status(200).json({ result: response })

//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message })
//   }
// }


// export const RefreshUserRoles = async (req: Request, res: Response) => {
//   try {
//     const user_id = req.query.user_id as string;
    
//     if (!user_id) {
//       return res.status(400).json({ error: "User ID is required" });
//     }

//     const response = await users.refreshUser(Number(user_id));

//     return res.status(200).json({ result: response });
//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message });
//   }
// };