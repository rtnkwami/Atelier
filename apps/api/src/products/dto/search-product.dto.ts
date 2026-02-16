import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductDto {
    @IsOptional()
    @IsString()
    public readonly name?: string;

    @IsOptional()
    @IsString()
    public readonly category?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    public readonly minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    public readonly maxPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    public readonly minStock?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    public readonly maxStock?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    public readonly page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    public readonly limit?: number = 20;
}
