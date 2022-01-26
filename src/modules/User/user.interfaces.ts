import { ID } from "../../common/common.interfaces";
import { Position, Roles, User } from "../../entities/User"; 

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

export interface UpdateUserRequestBody {
    token: string;
    id: ID;
    email: string;
    password: string;
    workplace: string;
    fullname: string;
    position: Position;
    rating: number;
    role: Roles;
}
export type UpdateRepositoryData = UpdateUserRequestBody;  
export interface UpdateUserResponse extends CommonResponse {
    user: User;
}