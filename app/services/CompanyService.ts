import type {
  CompanyResponseDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdatePrivateCompanyDto,
} from "~/dto";
import axios from "axios";
import { BackendConfig } from "~/configs";

export class CompanyService {
  private static prefix = "/api/companies";
  private static BACKEND_URL = BackendConfig.BACKEND_URL;
  private static API_URL = this.BACKEND_URL + this.prefix;

  public static async createCompany(
    company: CreateCompanyDto,
  ): Promise<CompanyResponseDto | null> {
    try {
      const response = await axios.post(`${this.API_URL}/`, company);
      const data: CompanyResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async updateCompanyById(
    body: UpdateCompanyDto,
  ): Promise<CompanyResponseDto | null> {
    try {
      const response = await axios.patch(`${this.API_URL}/${body.id}`, body);
      const data: CompanyResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async updatePrivateCompanyById(
    body: UpdatePrivateCompanyDto,
  ): Promise<CompanyResponseDto | null> {
    try {
      const response = await axios.patch(
        `${this.API_URL}/private/${body.id}`,
        body,
      );
      const data: CompanyResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async getCompanyById(
    id: number,
  ): Promise<CompanyResponseDto | null> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
      const data: CompanyResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async getAllCompany(): Promise<CompanyResponseDto[]> {
    try {
      const response = await axios.get(`${this.API_URL}/`);
      const data: CompanyResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }

  public static async getCompanyByCode(
    code: string,
  ): Promise<CompanyResponseDto | null> {
    try {
      const response = await axios.get(`${this.API_URL}/getByCode/${code}}`);
      const data: CompanyResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async deleteCompanyById(
    id: number,
  ): Promise<CompanyResponseDto | null> {
    try {
      const response = await axios.delete(`${this.API_URL}/${id}`);
      const data: CompanyResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }
}
