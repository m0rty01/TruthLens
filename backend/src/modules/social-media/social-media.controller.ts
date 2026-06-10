import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SocialMediaService, PlatformStatus, SearchResult, TrendingResult } from './social-media.service';

@ApiTags('Social Media')
@Controller('social-media')
export class SocialMediaController {
  private readonly logger = new Logger(SocialMediaController.name);

  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get status of all social media platform integrations' })
  @ApiResponse({ status: 200, description: 'Platform status list' })
  getStatus(): { platforms: PlatformStatus[] } {
    return { platforms: this.socialMediaService.getPlatformStatus() };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search across configured social media platforms' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query string' })
  @ApiQuery({ name: 'platforms', required: false, description: 'Comma-separated list of platforms (x,reddit,youtube,tiktok,instagram,facebook)' })
  @ApiQuery({ name: 'maxResults', required: false, description: 'Maximum results per platform (default: 25)' })
  @ApiQuery({ name: 'language', required: false, description: 'Language filter (default: en)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Query('query') query: string,
    @Query('platforms') platforms?: string,
    @Query('maxResults') maxResults?: string,
    @Query('language') language?: string,
  ): Promise<SearchResult> {
    if (!query) {
      return {
        posts: [],
        platforms: [],
        totalFound: 0,
        query: '',
        timestamp: new Date().toISOString(),
      };
    }

    const platformList = platforms 
      ? platforms.split(',').map(p => p.trim().toLowerCase())
      : undefined;

    return this.socialMediaService.search({
      query,
      platforms: platformList,
      maxResults: maxResults ? parseInt(maxResults, 10) : 25,
      language: language || 'en',
    });
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending narratives based on tracked keywords' })
  @ApiQuery({ name: 'keywords', required: false, description: 'Comma-separated keywords to track' })
  @ApiResponse({ status: 200, description: 'Trending narratives' })
  async getTrending(
    @Query('keywords') keywords?: string,
  ): Promise<TrendingResult> {
    const keywordList = keywords 
      ? keywords.split(',').map(k => k.trim())
      : undefined;

    return this.socialMediaService.getTrending(keywordList);
  }

  @Get('platform/:platform/posts')
  @ApiOperation({ summary: 'Get posts from a specific platform' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum results' })
  @ApiResponse({ status: 200, description: 'Platform posts' })
  async getPlatformPosts(
    @Query('platform') platform: string,
    @Query('query') query: string,
    @Query('limit') limit?: string,
  ): Promise<SearchResult> {
    return this.socialMediaService.getPlatformPosts(platform, {
      query: query || '',
      maxResults: limit ? parseInt(limit, 10) : 25,
    });
  }

  @Get('analyze')
  @ApiOperation({ summary: 'Analyze sentiment of provided text' })
  @ApiQuery({ name: 'text', required: true, description: 'Text to analyze' })
  @ApiResponse({ status: 200, description: 'Sentiment analysis result' })
  analyze(@Query('text') text: string): { sentiment: any; virality: number } {
    return this.socialMediaService.analyzeText(text || '');
  }
}
