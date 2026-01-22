import type { CreateIsoAssessmentDto, UpdateIsoAssessmentDto, IsoAssessmentResponseDto } from "~/dto";
import axios from "axios";

export class IsoAssessmentService {
	private static prefix = "/api/iso-assessments";
	private static BACKEND_URL = import.meta.env.BACKEND_URL || "NO_BACKEND_URL_CONFIG_IN_ENV";
	private static API_URL = this.BACKEND_URL+this.prefix;

    public static async createIsoAssessment(body: CreateIsoAssessmentDto): Promise<IsoAssessmentResponseDto | null> {
        try {
            const response = await axios.post(`${this.API_URL}/`, body);
            const data: IsoAssessmentResponseDto = await response.data;
            return data;
        } catch (error) {
            console.error("Error :", error);
            return null;
        }
    }

    public static async getIsoAssessmentById(id: number): Promise<IsoAssessmentResponseDto | null> {
        try {
            const response = await axios.get(`${this.API_URL}/${id}`);
            const data: IsoAssessmentResponseDto = await response.data;
            return data;
        } catch (error) {
            console.error("Error :", error);
            return null;
        }
    }

	public static async getAllIsoAssessment(): Promise<IsoAssessmentResponseDto[]> {
        try {
            const response = await axios.get(`${this.API_URL}/`);
            const data: IsoAssessmentResponseDto[] = await response.data;
            return data;
        } catch (error) {
            console.error("Error :", error);
            return [];
        }
    }

    public static async getIsoAssessmentByCompanyId(companyId: number): Promise<IsoAssessmentResponseDto | null> {
        try {
            const response = await axios.get(`${this.API_URL}/company/${companyId}`);
            const data: IsoAssessmentResponseDto = await response.data;
            return data;
        } catch (error) {
            console.error("Error :", error);
            return null;
        }
    }

    public static async updateIsoAssessmentById(body: UpdateIsoAssessmentDto): Promise<IsoAssessmentResponseDto | null> {
        try {
            const response = await axios.patch(`${this.API_URL}/${body.id}`, body);
            const data: IsoAssessmentResponseDto = await response.data;
            return data;
        } catch (error) {
            console.error("Error :", error);
            return null;
        }
    }

    public static async deleteIsoAssessmentById(id: number): Promise<boolean> {
        try {
            const response = await axios.delete(`${this.API_URL}/${id}`);
            return response.status === 200;
        } catch (error) {
            console.error("Error :", error);
            return false;
        }
    }
}
