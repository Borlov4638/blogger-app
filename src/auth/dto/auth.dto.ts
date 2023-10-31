import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
export class PasswordRecoveryDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  newPassword: string;
  @IsNotEmpty()
  @IsString()
  recoveryCode: string;
}

export class RegistrationEmailResendingDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class registrationCodeDto {
  @IsUUID('all')
  code: string;
}
