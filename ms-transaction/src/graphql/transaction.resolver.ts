import { Args, Query, Resolver } from '@nestjs/graphql';
import { TransactionResponseDto } from 'src/dtos/transaction-response.dto';
import { TransactionGraphql } from 'src/entities/transaction.entity.graphql';
import { TransactionsService } from 'src/services/transactions.service';

@Resolver(() => TransactionGraphql)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionsService) {}

  @Query(() => TransactionGraphql, { nullable: true })
  async getTransactions(
    @Args('transactionExternalId') transactionExternalId: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.getTransactionByExternalId(
      transactionExternalId,
    );
  }

  @Query(() => [TransactionGraphql])
  async getTransactionsAll(): Promise<TransactionResponseDto[]> {
    return this.transactionService.getTransactionAll();
  }
}
