import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderStatusEnum } from 'src/generated/prisma/enums';

class DateRangeDto {
    @IsString()
    from: string;

    @IsString()
    to: string;
}

export class OrdersSearchDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    dateRange?: DateRangeDto;

    @IsOptional()
    @IsEnum(OrderStatusEnum)
    status?: OrderStatusEnum;
}
