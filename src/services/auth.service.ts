import {Request, Response} from "express";
import bcrypt from 'bcrypt';
import {User} from "../model/User";
import {generateTokens} from "../helpers/auth.helper";
import {UserDto} from "../dto/user.dto";
import {Tokens} from "../interfaces/tokens.interface";
import {Token} from "../model/Token";
import jwt, {JwtPayload} from "jsonwebtoken";

export class AuthService {
  login(req: Request, res: Response) {
    const {login, password} = req.body;
    let user: UserDto;
    let tokens: Tokens;
    
    const loginPromise = new Promise((resolve) => {
      try {
        resolve(User.findOne({login: login}))
      } catch (e) {
        res.status(401).send({message: 'CONNECTION_ERROR'});
      }
    })
    
    loginPromise
      .then(async (response: any) => {
        if (!response) return Promise.reject({code: 403, message: 'WRONG_LOGIN_PASSWORD'});
        user = new UserDto(response);
        
        return bcrypt.compare(password, <string>response.password)
      })
      .then(async (response) => {
        if (!response) return Promise.reject({code: 403, message: 'WRONG_LOGIN_PASSWORD'});
        tokens = generateTokens({...user});
        res.cookie('bda_app_secure', tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          sameSite: false
        })
        
        const isToken = await Token.findOne({user_id: user._id});
        
        if (isToken) {
          await Token.updateOne({user_id: user._id}, {token: tokens.refreshToken})
          return Promise.resolve();
        }
        
        return Token.insertMany({user_id: user._id, token: tokens.refreshToken})
      })
      .then(() => {
        res.status(200).send({message: 'SUCCESS', user: {...user, token: tokens.accessToken}})
      })
      .catch((e) => {
        res.status(e.code || 409).send({message: e.message});
      })
  }
  
  logout(req: Request, res: Response) {
    const jwtToken = req.cookies.bda_app_secure;
    if (!jwtToken) return res.status(204).end();
    
    const logoutPromise = new Promise(async (resolve) => {
      try {
        const tokenCheck = await Token.findOne({token: jwtToken})
        resolve(tokenCheck);
      } catch {
        res.status(401).send({message: 'CONNECTION_ERROR'});
      }
    });
    
    logoutPromise
      .then(async (response) => {
        if (!response) {
          res.clearCookie('bda_app_secure', {httpOnly: true, secure: true, sameSite: false})
          return res.status(204).end();
        } else {
          try {
            await Token.findOneAndUpdate({token: jwtToken}, {token: ''})
            res.clearCookie('bda_app_secure', {httpOnly: true, secure: true, sameSite: false})
            res.status(204).end();
          } catch {
            return Promise.reject();
          }
        }
      })
      .catch(() => {
        res.status(401).send({message: 'CONNECTION_ERROR'});
      });
  }
  
  register(req: Request, res: Response) {
    const {login, password} = req.body;
    
    const registerPromise = new Promise((resolve) => {
      resolve(User.findOne({login: login}))
    }).catch(() => {
      res.status(401).send({message: 'CONNECTION_ERROR'});
    });
    
    registerPromise
      .then(async (response: any) => {
        if (response) return Promise.reject({code: 403, message: 'LOGIN_IN_USE'});
        
        const hashedPassword = await bcrypt.hash(password, 8);
        return User.insertMany([{
          login,
          password: hashedPassword,
        }])
      })
      .then(() => {
        res.status(200).send({message: 'SUCCESS'});
      })
      .catch((e) => {
        res.status(e.code).send({message: e.message});
      })
  }
  
  async refresh(req: Request, res: Response) {
    const jwtToken = req.cookies.bda_app_secure;
    if (!jwtToken) return res.status(200).send({message: 'NOT_AUTHORIZED1'});
    
    const refreshToken = new Promise(async (resolve) => {
      const token = await Token.findOne({token: jwtToken});
      
      resolve(token);
    }).catch((e) => {
      res.status(e.code).send({message: e.message});
    })
    
    refreshToken
      .then((response: any) => {
        if (!response) return Promise.reject({code: 401, message: 'NOT_AUTHORIZED2'});
        
        try {
          const decoded = <JwtPayload>jwt.verify(jwtToken, <string>process.env.JWT_REFRESH_SECRET);
          const user = new UserDto(decoded);
          const newAccessToken = jwt.sign({...user}, <string>process.env.JWT_ACCESS_SECRET, {expiresIn: '60m'});
          
          if (decoded._id !== response.user_id) {
            return Promise.reject()
          }
          
          res.status(200).send({message: 'SUCCESS', user: {...user, token: newAccessToken}})
        } catch (e) {
          res.status(401).send({message: 'NOT_AUTHORIZED3'});
        }
      })
      .catch((value: { code: number; message: string }) => {
        res.status(value.code).send({message: value.message});
      });
  }
}
