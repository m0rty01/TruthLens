import { Module, Global } from '@nestjs/common';
import { MockDataService } from './mock-data.service';

@Global()
@Module({
  providers: [MockDataService],
  exports: [MockDataService],
})
export class MockDataModule {}
