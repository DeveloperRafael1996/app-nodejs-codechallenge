import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import { TransactionMapper } from '../mappers/transaction.mapper';
import { TransactionDTO } from '../dtos/transaction.dto';
import { TransactionStatus } from 'src/helper/contants';
import { TransactionResponseDto } from 'src/dtos/transaction-response.dto';
import { KafkaService } from './kafka.service';
import { UpdateTransactionDTO } from 'src/dtos/transaction-update.dtp';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TransactionsService {
  constructor(
    private transactionRepository: TransactionRepository,
    private mapper: TransactionMapper,
    private readonly kafkaService: KafkaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createTransaction(dto: TransactionDTO): Promise<TransactionDTO> {
    dto.status = TransactionStatus.PENDING;
    const transaction = await this.transactionRepository.saveTransaction(dto);
    Logger.log('Sending transaction created');

    this.kafkaService.sendTransactionVerify({
      transactionExternalId: transaction.transactionExternalId,
      value: transaction.value,
    });

    return this.mapper.entityToDto(transaction);
  }

  async getTransactionByExternalId(
    transactionExternalId: string,
  ): Promise<TransactionResponseDto> {
    const cacheKey = `transaction:${transactionExternalId}`;
    Logger.log('Searching for transaction in cache');
    Logger.log(cacheKey);

    const cachedTransaction =
      await this.cacheManager.get<TransactionResponseDto>(cacheKey);

    if (cachedTransaction) {
      Logger.log('Transaction found in cache');

      return cachedTransaction;
    }

    const transaction = await this.transactionRepository.findById(
      transactionExternalId,
    );

    if (transaction === null) {
      throw new NotFoundException('Transaction not found');
    }

    const responseDto = this.mapper.entityDomainToResponse(transaction);
    const cache = await this.cacheManager.set<TransactionResponseDto>(
      cacheKey,
      responseDto,
      3000,
    );
    Logger.log('Cache set');
    Logger.log(cache);

    return responseDto;
  }

  async update(UpdateDTO: UpdateTransactionDTO): Promise<TransactionDTO> {
    const transaction = await this.transactionRepository.update(UpdateDTO);
    return this.mapper.entityToDto(transaction);
  }

  async getTransactionAll(): Promise<TransactionResponseDto[]> {
    const transaction = await this.transactionRepository.findAll();
    return transaction.map((tx) => this.mapper.entityDomainToResponse(tx));
  }
}
