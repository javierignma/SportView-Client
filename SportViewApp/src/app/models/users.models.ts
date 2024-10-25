export interface User {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}