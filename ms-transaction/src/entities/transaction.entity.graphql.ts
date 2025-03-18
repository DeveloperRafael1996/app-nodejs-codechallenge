import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class TransactionTypeGraphql {
  @Field()
  name: number;
}

@ObjectType()
export class TransactionStatusGraphql {
  @Field()
  name: string;
}

@ObjectType()
export class TransactionGraphql {
  @Field(() => ID)
  transactionExternalId: string;

  @Field(() => TransactionTypeGraphql)
  transactionType: TransactionTypeGraphql;

  @Field(() => TransactionStatusGraphql)
  transactionStatus: TransactionStatusGraphql;

  @Field(() => String)
  accountExternalIdDebit: string;

  @Field(() => String)
  accountExternalIdCredit: string;

  @Field(() => Int)
  tranferTypeId: number;

  @Field(() => Float)
  value: number;

  @Field(() => Int)
  status: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
