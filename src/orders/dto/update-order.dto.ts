import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatusEnum } from 'src/generated/prisma/enums';

export class UpdateOrderDto {
    @IsNotEmpty()
    @IsEnum(OrderStatusEnum)
    public readonly status: OrderStatusEnum;
}
