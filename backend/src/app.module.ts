import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MockDataModule } from './mock-data/mock-data.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { NarrativesController } from './modules/narratives/narratives.controller';
import { ViralContentController } from './modules/viral-content/viral-content.controller';
import { ClaimsController } from './modules/claims/claims.controller';
import { PlaybooksController } from './modules/playbooks/playbooks.controller';
import { CopilotController } from './modules/copilot/copilot.controller';
import { ReportsController } from './modules/reports/reports.controller';
import {
  ExaggerationController,
  AIDetectionController,
  OriginController,
  NetworksController,
  AttributionController,
  BotDetectionController,
  CommunityReportController,
  IncidentsController,
  HarassmentToolkitController,
  CommunityToolkitController,
  LearnController,
  ContributionsController,
  MythsController,
  EconomicImpactController,
  ForecastController,
  AdvisorController,
} from './modules/scaffolded-controllers';
import { HarmIntelligenceController } from './modules/harm-intelligence/harm-intelligence.controller';
import { EarlyWarningController } from './modules/early-warning/early-warning.controller';
import { ResilienceController } from './modules/resilience/resilience.controller';
import { CorrelationController } from './modules/correlation/correlation.controller';
import { ModeratorController } from './modules/moderator/moderator.controller';
import { ResearchController } from './modules/research/research.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    AuthModule,
    MockDataModule,
    SocialMediaModule,
  ],
  controllers: [
    NarrativesController,
    ViralContentController,
    ClaimsController,
    PlaybooksController,
    CopilotController,
    ReportsController,
    ExaggerationController,
    AIDetectionController,
    OriginController,
    NetworksController,
    AttributionController,
    BotDetectionController,
    CommunityReportController,
    IncidentsController,
    HarassmentToolkitController,
    CommunityToolkitController,
    LearnController,
    ContributionsController,
    MythsController,
    EconomicImpactController,
    ForecastController,
    AdvisorController,
    // New feature modules
    HarmIntelligenceController,
    EarlyWarningController,
    ResilienceController,
    CorrelationController,
    ModeratorController,
    ResearchController,
  ],
})
export class AppModule {}
