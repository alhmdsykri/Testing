export class RefreshTokenResponseDto {
  public transactionId?: string;
  public statusCode?: number | null;
  public message?: string;
  public accessToken?: string;
  public refreshToken?: string;
  public idToken?: string;


}
