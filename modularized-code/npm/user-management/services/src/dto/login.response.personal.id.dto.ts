export class LoginPersonalIdResponseDto {
  public transactionId?: string;
  public code?: number | null;
  public message?: string;
  public userId?: string;
  public expiresIn?: number | null;
  public accessToken?: string;
}
