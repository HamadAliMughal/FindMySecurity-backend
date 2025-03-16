import { UserResponse } from "../users/types";

export interface LoginRequest {
  email: string,
  password: string
}

export interface UserResponseWithToken extends Omit<UserResponse, 'password'> {
  token: string;
  roles?: RoleInfo[];
}

export interface RoleInfo {
  role_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date
}


export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ValidateCodeRequest {
  code: string,
  email: string
}

export interface ResetPasswordRequest {
  code: string,
  password: string,
  email: string
}

export interface dataGoogle{
  access_token: string,
  expires_in: number,
  scope: string,
  token_type: string,
  invitation?: string
}

export interface dataFacebook{
  userID?: string,
  expiresIn?: string,
  accessToken: string,
  signedRequest?: string,
  graphDomain?: string,
  data_access_expiration_time?: number,
  invitation?: string
}

export interface dataApple{
  authorization: dataAuthApple,
  user: dataUserAuthApple,
  invitation?: string,
  location?: string
}

export interface dataAuthApple{
  code: string,
  id_token: string,
  state: string,
}

export interface dataUserAuthApple{
  name: any,
  email: string
}