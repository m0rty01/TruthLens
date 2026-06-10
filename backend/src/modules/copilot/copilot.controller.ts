import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDataService } from '../../mock-data/mock-data.service';
@ApiTags('AI Copilot')
@Controller('copilot')
export class CopilotController {
  constructor(private readonly mockData: MockDataService) {}
  @Post('chat') @ApiOperation({ summary: 'Send message to AI copilot' }) chat(@Body() body: { message: string }) { return this.mockData.copilotChat(body.message); }
}
