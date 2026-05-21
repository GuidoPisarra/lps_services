/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './controllers/protected.controller';
import { PaymentsController } from './controllers/payment.controller';
import { VehicleInspectionController } from './controllers/vehicle-inspection.controller';
import { LogsController } from './controllers/logs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: 'PAYMENTS_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'payments_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'LOGS_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'logs_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
    AuthModule,
  ],
  controllers: [ProtectedController, PaymentsController, VehicleInspectionController, LogsController],
  providers: [
    {
      provide: 'VEHICLE_INSPECTION_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'vehicle_inspection_rpc',
            queueOptions: { durable: true },
          },
        }),
    },
  ],
  exports: ['VEHICLE_INSPECTION_SERVICE'],
})
export class AppModule { }
