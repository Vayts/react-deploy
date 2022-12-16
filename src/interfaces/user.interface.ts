export interface User {
  id: number;
  role: string;
  login: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}
