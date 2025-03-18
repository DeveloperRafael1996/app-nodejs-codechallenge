import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FraudeDTO } from 'src/dto/fraude.dto';
import { KafkaService } from 'src/services/kafka.service';

@Controller()
export class FraudeController {
  private readonly logger = new Logger('FraudeController');

  constructor(private readonly kafkaService: KafkaService) {}

  @MessagePattern('transaction-created')
  transactionVerify(@Payload() data: FraudeDTO) {
    Logger.log('Receiving transaction to verify');

    return this.kafkaService.verifyTransactionFraude(data);
  }
}
