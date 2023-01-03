export class UserDto {
   login: string;
   
   _id: string;
  
  constructor(user: any) {
    this.login = user.login;
    this._id = user._id
  }
}
