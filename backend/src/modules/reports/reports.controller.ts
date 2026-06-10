import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly mockData: MockDataService) {}
  @Get() @ApiOperation({ summary: 'List intelligence reports' }) findAll() { return this.mockData.getReports(); }
  @Get(':id') @ApiOperation({ summary: 'Get report by ID' }) findOne(@Param('id') id: string) { return this.mockData.getReportById(id); }
}
