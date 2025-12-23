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
    id: string;

    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsUrl()
    image: string;
}

export class CreateCartDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItem)
    items: CartItem[];
}
