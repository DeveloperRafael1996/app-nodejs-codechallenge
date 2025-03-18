import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionMapper } from './mappers/transaction.mapper';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionsService } from './services/transactions.service';
import { KafkaService } from './services/kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { JwtStrategy } from './providers/jwt-strategy.provider';
import { GqlModuleOptions, GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TransactionResolver } from './graphql/transaction.resolver';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
      ttl: 300,
      isGlobal: true,
      auth_pass: 'Clarita24@@',
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => {
        return {
          autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
          sortSchema: true,
          debug: true,
          uploads: false,
          path: '/graphql',
          introspection: true,
          playground: true,
          csrfPrevention: false,
        } as GqlModuleOptions;
      },
    }),

    TypeOrmModule.forFeature([TransactionEntity]),

    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      entities: [TransactionEntity],
    }),

    ClientsModule.register([
      {
        name: 'TRANSACTION_KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'ms-transaction-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionRepository,
    TransactionMapper,
    TransactionsService,
    KafkaService,
    JwtStrategy,
    TransactionResolver,
  ],
})
export class AppModule {}
