import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
    @IsString()
    public readonly sub: string;

    @IsString()
    public readonly email: string;

    @IsOptional()
    @IsUrl()
    public readonly picture?: string;
}
