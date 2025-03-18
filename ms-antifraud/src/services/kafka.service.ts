import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { TransactionDTO } from 'src/dto/transaction.dto';
import { TransactionStatus } from 'src/helper/contants';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger('AntiFraude KafkaService');

  constructor(
    @Inject('ANTIFRAUDE_KAFKA_SERVICE')
    private readonly authClient: ClientKafka,
  ) {}
  verifyTransactionFraude(transaction: TransactionDTO) {
    const { transactionExternalId, value } = transaction;
    const status =
      value > 1000 ? TransactionStatus.REJECTED : TransactionStatus.APPROVED;

    const statusDescription = TransactionStatus[status];
    this.logger.log(`Transaction status ${statusDescription}`);
    const eventPayload = { transactionExternalId, status };

    const eventName =
      status === TransactionStatus.REJECTED
        ? 'transaction-status-rejected'
        : 'transaction-status-approved';

    return this.authClient.emit(eventName, JSON.stringify(eventPayload));
  }
}
