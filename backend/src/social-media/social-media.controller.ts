import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SocialMediaAggregator, PlatformStatus } from './aggregator.service';
import { MockDataService } from '../mock-data/mock-data.service';

@ApiTags('Social Media')
@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly aggregator: SocialMediaAggregator,
    private readonly mockData: MockDataService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get API key status for all platforms' })
  getStatus() {
    return this.aggregator.getPlatformStatus();
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get aggregated viral content feed from all platforms' })
  async getFeed(@Query('platform') platform?: string, @Query('query') query?: string) {
    const searchQuery = query || 'Indian immigrants';

    // If a specific platform is requested, fetch from that platform
    if (platform) {
      const livePosts = await this.aggregator.fetchByPlatform(platform, searchQuery);
      if (livePosts.length > 0) return livePosts;
    } else {
      // Fetch from all platforms
      const livePosts = await this.aggregator.fetchAll(searchQuery);
      if (livePosts.length > 0) return livePosts;
    }

    // Fallback to mock data if no live data available
    const mockContent = this.mockData.getViralContent();
    return platform ? mockContent.filter((c) => c.platform === platform) : mockContent;
  }

  @Get('platform/:name')
  @ApiOperation({ summary: 'Get posts from a specific platform' })
  async getPlatform(@Param('name') name: string, @Query('query') query?: string) {
    const searchQuery = query || 'Indian immigrants';
    const livePosts = await this.aggregator.fetchByPlatform(name, searchQuery);
    if (livePosts.length > 0) return livePosts;

    // Fallback
    const mockContent = this.mockData.getViralContent();
    return mockContent.filter((c) => c.platform.toLowerCase() === name.toLowerCase());
  }

  @Post('keys')
  @ApiOperation({ summary: 'Update API keys for social media platforms' })
  async updateKeys(@Body() keys: Record<string, string>) {
    return this.aggregator.updateApiKeys(keys);
  }
}
