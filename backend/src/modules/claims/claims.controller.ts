import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';
@ApiTags('Claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly mockData: MockDataService) {}
  @Get() @ApiOperation({ summary: 'List claims' }) findAll() { return this.mockData.getClaims(); }
  @Get(':id') @ApiOperation({ summary: 'Get claim by ID' }) findOne(@Param('id') id: string) { return this.mockData.getClaimById(id); }
  @Post('verify') @ApiOperation({ summary: 'Submit claim for verification' }) verify(@Body() body: { text: string }) { return { status: 'submitted', message: 'Claim submitted for verification', text: body.text }; }
}
