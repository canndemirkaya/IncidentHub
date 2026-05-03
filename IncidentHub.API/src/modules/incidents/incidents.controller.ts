import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseFilters, UseInterceptors } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/request/create-incident.dto';
import { UpdateIncidentDto } from './dto/request/update-incident.dto';
import { GetIncidentsQueryDto } from './dto/request/get-incidents-query.dto';
import { AllExceptionsFilter } from '../../common/filters/http-exception.filter';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { IncidentResponseDto } from './dto/response/incident-response.dto';
import { IncidentListResponseDto } from './dto/response/incident-list-response.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('incidents')
@Controller('incidents')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(LoggingInterceptor)
export class IncidentsController {
    constructor(private service: IncidentsService, private auditLogs: AuditLogsService) { }

    @Post('Create')
    @ApiOperation({ summary: 'Create a new incident' })
    @ApiResponse({ status: 201, description: 'Created', type: IncidentResponseDto })
    async create(@Body() dto: CreateIncidentDto) {
        const data = await this.service.create(dto);
        return { success: true, data };
    }

    @Get('GetAll')
    @ApiOperation({ summary: 'List incidents with pagination and filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'severity', required: false })
    @ApiQuery({ name: 'service', required: false })
    @ApiResponse({ status: 200, description: 'List response', type: IncidentListResponseDto })
    async getAll(@Query() query: GetIncidentsQueryDto) {
        const res = await this.service.findAll(query);
        return { success: true, ...res };
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get incidents summary counts' })
    @ApiOkResponse({ description: 'Summary' })
    async getSummary() {
        const s = await this.service.summary();
        return { success: true, data: s };
    }

    @Get('Get/:id')
    @ApiOperation({ summary: 'Get incident by id' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200, description: 'Incident', type: IncidentResponseDto })
    async get(@Param('id') id: string) {
        const data = await this.service.findOne(id);
        return { success: true, data };
    }

    @Patch('Update/:id')
    @ApiOperation({ summary: 'Update incident fields (status, severity, description, title, service)' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200, description: 'Updated incident', type: IncidentResponseDto })
    async update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
        const data = await this.service.update(id, dto);
        return { success: true, data };
    }

    @Delete('Delete/:id')
    @ApiOperation({ summary: 'Delete (soft) an incident by id' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200, description: 'Deleted' })
    async remove(@Param('id') id: string) {
        await this.service.remove(id);
        return { success: true };
    }

    @Get(':id/audit-logs')
    @ApiOperation({ summary: 'Get audit logs for an incident' })
    @ApiParam({ name: 'id' })
    @ApiOkResponse({ description: 'Audit logs' })
    async getAuditLogs(@Param('id') id: string) {
        const items = await this.auditLogs.getForIncident(id);
        return { success: true, data: items };
    }



}
