import { Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { OnModuleInit, Inject } from '@nestjs/common';
import { TransactionEventDTO } from 'src/dtos/transaction-event.dto';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger('Transaction KafkaService');

  constructor(
    @Inject('TRANSACTION_KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async sendTransactionVerify(transactionEventDTO: TransactionEventDTO) {
    Logger.log('Sending transaction to kafka to ms-anti-fraud');

    this.kafkaClient.emit(
      'transaction-created',
      JSON.stringify(transactionEventDTO),
    );
    this.logger.debug(JSON.stringify(transactionEventDTO));
  }
}
