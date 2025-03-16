export interface UserRequest {
  email: string;
  password: string;
  roleId: number; // Required to assign the user a role
  data?: any; // Extra data field to support profile-specific data
}

export interface UserResponse {
  id: number;
  email: string;
  role?: { id: number; name: string }; // Adjusted to return role details
  createdAt: Date;
  updatedAt: Date;
  roleUsers?: RoleUserResponse[];
  individualProfessional?: IndividualProfessionalResponse | null;
  profileData?: any[];
  companyData?: any[];
  providerData?: any[]; 
  client?: ClientResponse | null;
  securityCompany?: SecurityCompanyResponse | null;
  courseProvider?: CourseProviderResponse | null;
}

export interface RoleUserResponse {
  id: number;
  roleId: number;
  userId: number;
  validated?: boolean;
  userType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualProfessionalResponse {
  id: number;
  userId: number;
  profileData: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientResponse {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityCompanyResponse {
  id: number;
  userId: number;
  companyData: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseProviderResponse {
  id: number;
  userId: number;
  providerData: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDelete {
  message: string;
}

export type ID = number; // IDs are integers in your schema
