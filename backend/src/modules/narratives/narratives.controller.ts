import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';

@ApiTags('Narratives')
@Controller('narratives')
export class NarrativesController {
  constructor(private readonly mockData: MockDataService) {}

  @Get()
  @ApiOperation({ summary: 'List all narratives' })
  findAll(@Query('category') category?: string) {
    const all = this.mockData.getNarratives();
    return category ? all.filter((n) => n.category === category) : all;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get narrative by ID' })
  findOne(@Param('id') id: string) {
    return this.mockData.getNarrativeById(id);
  }
}
