import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';
@ApiTags('Playbooks')
@Controller('playbooks')
export class PlaybooksController {
  constructor(private readonly mockData: MockDataService) {}
  @Get() @ApiOperation({ summary: 'List playbooks' }) findAll() { return this.mockData.getPlaybooks(); }
  @Get(':id') @ApiOperation({ summary: 'Get playbook by ID' }) findOne(@Param('id') id: string) { return this.mockData.getPlaybookById(id); }
  @Post('generate') @ApiOperation({ summary: 'Generate response playbook' }) generate(@Body() body: { narrative: string; situation: string }) { return { status: 'generated', title: `Response for: ${body.narrative}`, responses: [{ type: 'professional', content: 'Based on evidence...', recommended: true }] }; }
}
