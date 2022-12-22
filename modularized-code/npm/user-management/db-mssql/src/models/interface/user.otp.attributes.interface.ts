export interface UserOTPAttributes {
  userOTPId: number,
  userId: string,
  otp: string,
  isActive: number,
  createdAt: string,
  modifiedAt?: string
};