import type { CreateUserDto, UpdateUserDto, UserResponseDto } from "~/dto";
import axios from "axios";
import { BackendConfig } from "~/configs";

export class UserService {
  private static prefix = "/api/users";
  private static BACKEND_URL = BackendConfig.BACKEND_URL;
  private static API_URL = this.BACKEND_URL + this.prefix;

  public static async createUser(
    body: CreateUserDto,
  ): Promise<UserResponseDto | null> {
    try {
      const response = await axios.post(`${this.API_URL}/`, body);
      const data: UserResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async getUserById(id: string): Promise<UserResponseDto | null> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
      const data: UserResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async getAllUser(): Promise<UserResponseDto[] | null> {
    try {
      const response = await axios.get(`${this.API_URL}/`);
      const data: UserResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async updateUserById(
    body: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    try {
      const response = await axios.patch(`${this.API_URL}/${body.id}`, body);
      const data: UserResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async deleteUserById(id: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.API_URL}/${id}`);
      return response.status === 200;
    } catch (error) {
      console.error("Error :", error);
      return false;
    }
  }
}
