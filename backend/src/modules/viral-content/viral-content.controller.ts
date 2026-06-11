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
    // Always try to fetch live data from configured platforms
    try {
      const searchQuery = query || 'india OR migration OR diaspora';
      const result = await this.socialMedia.search({ 
        query: searchQuery, 
        platforms: platform ? [platform.toLowerCase()] : undefined,
        maxResults: 50 
      });
      if (result.posts.length > 0) return result.posts;
    } catch (e) {
      // Fall through to mock data
    }

    // Fallback to mock data if no live data available
    const all = this.mockData.getViralContent();
    return platform ? all.filter((c) => c.platform === platform) : all;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get viral content by ID' })
  async findOne(@Param('id') id: string) {
    // Check if this is a live content ID (format: live-{platform}-{actualId})
    if (id.startsWith('live-')) {
      const liveContent = await this.socialMedia.getPostById(id);
      if (liveContent) return liveContent;
    }
    // Fallback to mock data
    return this.mockData.getViralContentById(id);
  }
}
