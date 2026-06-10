import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocialMediaAggregator } from './aggregator.service';
import { SocialMediaController } from './social-media.controller';
import { MockDataModule } from '../mock-data/mock-data.module';

@Module({
  imports: [ConfigModule, MockDataModule],
  controllers: [SocialMediaController],
  providers: [SocialMediaAggregator],
  exports: [SocialMediaAggregator],
})
export class SocialMediaModule {}
