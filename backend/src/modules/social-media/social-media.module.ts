import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocialMediaService } from './social-media.service';
import { SocialMediaController } from './social-media.controller';
import { RedditService } from './platforms/reddit.service';
import { YouTubeService } from './platforms/youtube.service';
import { XService } from './platforms/x.service';
import { MetaService } from './platforms/meta.service';
import { TikTokService } from './platforms/tiktok.service';

@Module({
  imports: [ConfigModule],
  controllers: [SocialMediaController],
  providers: [
    SocialMediaService,
    RedditService,
    YouTubeService,
    XService,
    MetaService,
    TikTokService,
  ],
  exports: [SocialMediaService],
})
export class SocialMediaModule {}
