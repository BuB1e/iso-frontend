import type {
  CreateSuggestionDto,
  UpdateSuggestionDto,
  SuggestionResponseDto,
} from "~/dto";
import axios from "axios";
import { BackendConfig } from "~/configs";

export class SuggestionService {
  private static prefix = "/api/suggestions";
  private static BACKEND_URL = BackendConfig.BACKEND_URL;
  private static API_URL = this.BACKEND_URL + this.prefix;

  public static async createSuggestion(
    body: CreateSuggestionDto,
  ): Promise<SuggestionResponseDto | null> {
    try {
      const response = await axios.post(`${this.API_URL}/`, body);
      const data: SuggestionResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async getSuggestionByControlId(
    controlId: number,
  ): Promise<SuggestionResponseDto | null> {
    try {
      const response = await axios.get(`${this.API_URL}/control/${controlId}`);
      const data: any = await response.data;
      if (Array.isArray(data)) {
        return data[0] || null;
      }
      return data as SuggestionResponseDto;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Expected if no suggestion exists
        return null;
      }
      console.error("Error fetching suggestion:", error.message || error);
      return null;
    }
  }

  public static async updateSuggestionById(
    body: UpdateSuggestionDto,
  ): Promise<SuggestionResponseDto | null> {
    try {
      const response = await axios.patch(`${this.API_URL}/${body.id}`, body);
      const data: SuggestionResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async deleteSuggestionById(id: number): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.API_URL}/${id}`);
      return response.status === 200;
    } catch (error) {
      console.error("Error :", error);
      return false;
    }
  }
}
