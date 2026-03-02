import type { AssessmentControlResponseDto } from "~/dto";
import axios from "axios";
import { getApiBaseUrl } from "~/configs";

export class AssessmentControlService {
  private static prefix = "/api/assessments";
  private static get API_URL() {
    return getApiBaseUrl() + this.prefix;
  }

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

  public static async getAllByIsoAssessmentId(
    id: number,
  ): Promise<AssessmentControlResponseDto[]> {
    try {
      const response = await axios.get(
        `${this.API_URL}/getAllByIsoAssessmentId/${id}`,
      );
      const data: AssessmentControlResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }
}
