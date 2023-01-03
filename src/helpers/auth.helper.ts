import jwt from 'jsonwebtoken';

export function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, <string>process.env.JWT_ACCESS_SECRET,{expiresIn: '60m'});
  const refreshToken = jwt.sign(payload, <string>process.env.JWT_REFRESH_SECRET,{expiresIn: '30d'});
  
  return {
    accessToken,
    refreshToken,
  }
}
