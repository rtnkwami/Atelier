import { Type } from 'class-transformer';
import {
    IsArray,
    IsNumber,
    IsPositive,
    IsString,
    IsUrl,
    IsUUID,
    ValidateNested,
} from 'class-validator';

export class CartItem {
    @IsUUID()
    public readonly id: string;

    @IsString()
    public readonly name: string;

    @IsNumber()
    @IsPositive()
    public readonly price: number;

    @IsNumber()
    @IsPositive()
    public readonly quantity: number;

    @IsUrl()
    public readonly image: string;
}

export class CreateCartDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItem)
    public readonly items: CartItem[];
}
