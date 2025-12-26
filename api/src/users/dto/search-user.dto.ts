import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';

class DateRangeDto {
    @IsString()
    public readonly from: string;

    @IsString()
    public readonly to: string;
}

export class UserSearchDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public readonly name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public readonly email?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    public readonly dateRange?: DateRangeDto;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public readonly page?: number;

    @IsOptional()
    @IsPositive()
    @IsPositive()
    public readonly limit?: number;
}
