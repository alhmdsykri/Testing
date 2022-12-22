export class LoginResponseDto {
  public transactionId?: string;
  public code?: number | null;
  public message?: string;
  public userId?: string;
  public expiresIn?: number | null;
  public accessToken?: string;
  public refreshToken?: string;
}
