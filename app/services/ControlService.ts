import type {
  ControlResponseDto,
  LlmSuggestRequest,
  SuggestionResponseDto,
  UpdateControlDto,
} from "~/dto";
import axios from "axios";
import { BackendConfig } from "~/configs";

export class ControlService {
  private static prefix = "/api/controls";
  private static BACKEND_URL = BackendConfig.BACKEND_URL;
  private static API_URL = this.BACKEND_URL + this.prefix;

  public static async getAllControl(): Promise<ControlResponseDto[]> {
    try {
      const response = await axios.get(`${this.API_URL}/`);
      const data: ControlResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }

  public static async getControlById(
    id: number,
  ): Promise<ControlResponseDto | null> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
      const data: ControlResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async updateControlById(
    body: UpdateControlDto,
  ): Promise<ControlResponseDto | null> {
    try {
      const response = await axios.patch(`${this.API_URL}/${body.id}`, body);
      const data: ControlResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  // Call LLM Suggestion Service
  public static async suggestControl(
    body: LlmSuggestRequest,
  ): Promise<SuggestionResponseDto | null> {
    try {
      const response = await axios.put(
        `${this.API_URL}/suggest/${body.id}`,
        body,
      );
      const data: SuggestionResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }
}
