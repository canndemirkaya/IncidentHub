import { ApiProperty } from '@nestjs/swagger';
import { IncidentResponseDto } from './incident-response.dto';

export class IncidentListResponseDto {
    @ApiProperty({ type: [IncidentResponseDto] })
    data!: IncidentResponseDto[];

    @ApiProperty()
    meta!: any;
}
