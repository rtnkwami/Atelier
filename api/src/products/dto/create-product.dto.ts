import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
} from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    public readonly name: string;

    @IsOptional()
    @IsString()
    public readonly description: string;

    @IsNotEmpty()
    @IsString()
    public readonly category: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public readonly price: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public readonly stock: number;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    public readonly images?: string[];
}
