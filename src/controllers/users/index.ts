import { prisma } from "../../bootstrap";
import { Body, Delete, Get, Post, Query, Route, Tags } from "tsoa";
import { ID, UserDelete, UserRequest, UserResponse } from "./types";

@Route("/api/users")
@Tags("Users")
export default class Users {
  @Post("/")
  public async createUser(@Body() req: UserRequest): Promise<UserResponse> {
    try {
      const data: any = req;

      const user = await prisma.user.create({ data });

      return {
        ...user,
      };
    } catch (error: any) {
      throw Error(error.message);
    }
  }
}
