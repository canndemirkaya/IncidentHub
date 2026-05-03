import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IncidentSeverity } from '../../enums/incident-severity.enum';
import { IncidentStatus } from '../../enums/incident-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIncidentDto {
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
    @IsNotEmpty()
    @ApiPropertyOptional()
    description?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiPropertyOptional()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @ApiPropertyOptional()
    service?: string;
}
