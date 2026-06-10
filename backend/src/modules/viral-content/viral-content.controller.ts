import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';
import { SocialMediaService } from '../social-media/social-media.service';

@ApiTags('Viral Content')
@Controller('viral-content')
export class ViralContentController {
  constructor(
    private readonly mockData: MockDataService,
    private readonly socialMedia: SocialMediaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List viral content (live + mock fallback)' })
  async findAll(@Query('platform') platform?: string, @Query('query') query?: string) {
    // Try live data first if query is provided
    if (query) {
      try {
        const result = await this.socialMedia.search({ 
          query, 
          platforms: platform ? [platform.toLowerCase()] : undefined,
          maxResults: 50 
        });
        if (result.posts.length > 0) return result.posts;
      } catch (e) {
        // Fall through to mock data
      }
    }

    // Fallback to mock data
    const all = this.mockData.getViralContent();
    return platform ? all.filter((c) => c.platform === platform) : all;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get viral content by ID' })
  findOne(@Param('id') id: string) { return this.mockData.getViralContentById(id); }
}
