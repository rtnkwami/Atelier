import { plainToInstance } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
    validateSync,
} from 'class-validator';

class EnvironmentVariables {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(65535)
    public readonly PORT: number;

    @IsString()
    @IsNotEmpty()
    public readonly DATABASE_URL: string;

    @IsString()
    @IsNotEmpty()
    public readonly AUDIENCE: string;

    @IsString()
    @IsNotEmpty()
    @IsUrl()
    public readonly ISSUER_BASE_URL: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
