import type { AssessmentControlResponseDto } from "~/dto";
import axios from "axios";
import { BackendConfig } from "~/configs";

export class AssessmentControlService {
  private static prefix = "/api/assessments";
  private static BACKEND_URL = BackendConfig.BACKEND_URL;
  private static API_URL = this.BACKEND_URL + this.prefix;

  public static async getAllAssessmentControl(): Promise<
    AssessmentControlResponseDto[]
  > {
    try {
      const response = await axios.get(`${this.API_URL}/getAll`);
      const data: AssessmentControlResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }

  public static async getAllByIsoAssessmentId(id: number): Promise<AssessmentControlResponseDto[]> {
    try {
      const response = await axios.get(`${this.API_URL}/getAllByIsoAssessmentId/${id}`);
      const data: AssessmentControlResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }
}
