import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';
import { SocialMediaAggregator } from '../../social-media/aggregator.service';

@ApiTags('Viral Content')
@Controller('viral-content')
export class ViralContentController {
  constructor(
    private readonly mockData: MockDataService,
    private readonly aggregator: SocialMediaAggregator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List viral content (live + mock fallback)' })
  async findAll(@Query('platform') platform?: string) {
    // Try live data first
    if (platform) {
      const livePosts = await this.aggregator.fetchByPlatform(platform);
      if (livePosts.length > 0) return livePosts;
    } else {
      const livePosts = await this.aggregator.fetchAll();
      if (livePosts.length > 0) return livePosts;
    }

    // Fallback to mock data
    const all = this.mockData.getViralContent();
    return platform ? all.filter((c) => c.platform === platform) : all;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get viral content by ID' })
  findOne(@Param('id') id: string) { return this.mockData.getViralContentById(id); }
}
