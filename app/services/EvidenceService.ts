import type {
  createEvidenceDto,
  EvidenceResponseDto,
  updateEvidenceDto,
} from "~/dto";
import axios from "axios";
import { getApiBaseUrl } from "~/configs";

export class EvidenceService {
  private static prefix = "/api/evidence";
  private static get API_URL() {
    return getApiBaseUrl() + this.prefix;
  }

  public static async createEvidence(
    body: createEvidenceDto,
  ): Promise<EvidenceResponseDto | null> {
    try {
      const response = await axios.post(`${this.API_URL}/`, body);
      const data: EvidenceResponseDto = await response.data;
      return data;
    } catch (error: any) {
      console.error("Create Evidence Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return null;
    }
  }

  public static async getEvidenceById(
    id: number,
  ): Promise<EvidenceResponseDto | null> {
    try {
      const response = await axios.get(`${this.API_URL}/${id}`);
      const data: EvidenceResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async getAllEvidence(): Promise<EvidenceResponseDto[]> {
    try {
      const response = await axios.get(`${this.API_URL}/`);
      const data: EvidenceResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }

  public static async getAllEvidenceByControlId(
    controlId: number,
  ): Promise<EvidenceResponseDto[]> {
    try {
      const response = await axios.get(
        `${this.API_URL}/getAllByControlId/${controlId}`,
      );
      const data: EvidenceResponseDto[] = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  }

  public static async updateEvidenceById(
    body: updateEvidenceDto,
  ): Promise<EvidenceResponseDto | null> {
    try {
      const response = await axios.patch(`${this.API_URL}/${body.id}`, body);
      const data: EvidenceResponseDto = await response.data;
      return data;
    } catch (error) {
      console.error("Error :", error);
      return null;
    }
  }

  public static async deleteEvidenceById(id: number): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.API_URL}/${id}`);
      return response.status === 200;
    } catch (error) {
      console.error("Error :", error);
      return false;
    }
  }
}
