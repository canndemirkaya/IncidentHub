import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IncidentSeverity } from '../../enums/incident-severity.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Database timeout on payment service' })
    title!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Users are receiving timeout errors during checkout.' })
    description!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Payment API' })
    service!: string;

    @IsEnum(IncidentSeverity)
    @ApiProperty({ example: IncidentSeverity.high, enum: IncidentSeverity })
    severity!: IncidentSeverity;
}
