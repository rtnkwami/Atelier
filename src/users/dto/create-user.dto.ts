import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
    @IsString()
    uid: string;

    @IsString()
    sub: string;

    @IsString()
    email: string;

    @IsOptional()
    @IsUrl()
    picture?: string;
}
