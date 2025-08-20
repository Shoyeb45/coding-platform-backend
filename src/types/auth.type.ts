export type UserRole = "SUPER_ADMIN" | "ADMIN" | "OPS" | "BATCHOPS" | "TEACHER" | "ASSISTANT_TEACHER" | "STUDENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string|undefined;
  phone:string;
}