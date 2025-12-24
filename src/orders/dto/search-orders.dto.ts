import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderStatusEnum } from 'src/generated/prisma/enums';

class DateRangeDto {
    @IsString()
    public readonly from: string;

    @IsString()
    public readonly to: string;
}

export class OrdersSearchDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeDto)
    public readonly dateRange?: DateRangeDto;

    @IsOptional()
    @IsEnum(OrderStatusEnum)
    public readonly status?: OrderStatusEnum;
}
