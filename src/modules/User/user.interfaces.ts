import { User } from "../../entities/User"; 

export interface CommonResponse {
    statusCode: number;
    message: string;
    error?: string;
}

export interface CheckAuthResponse extends CommonResponse {
    user: User;
}

export type RegisterRepositoryData = RegisterRequestBody;
export interface RegisterRequestBody {
    email: string;
    workplace: string;
    fullname: string;
    password: string;
}