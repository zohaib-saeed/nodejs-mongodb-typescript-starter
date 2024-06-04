import { Request } from "express";

export interface ISignUpRequestBody {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface ISigninRequestBody {
  email: string;
  password: string;
}

export interface IUser {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface IRequest extends Request {
  user: IUser;
}
