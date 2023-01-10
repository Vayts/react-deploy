export interface User {
  id: number,
  _id: string;
  login: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}
