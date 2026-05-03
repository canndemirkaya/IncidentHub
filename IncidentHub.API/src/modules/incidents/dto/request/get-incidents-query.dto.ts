import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentSeverity } from '../../enums/incident-severity.enum';
import { IncidentStatus } from '../../enums/incident-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetIncidentsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiPropertyOptional({ example: 1 })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @ApiPropertyOptional({ example: 10 })
    limit?: number = 10;

    @IsOptional()
    @IsEnum(IncidentStatus)
    @ApiPropertyOptional({ enum: IncidentStatus })
    status?: IncidentStatus;

    @IsOptional()
    @IsEnum(IncidentSeverity)
    @ApiPropertyOptional({ enum: IncidentSeverity })
    severity?: IncidentSeverity;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    service?: string;
}
