import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { HealthModule } from './modules/health/health.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, IncidentsModule, AuditLogsModule, HealthModule],
})
export class AppModule { }
