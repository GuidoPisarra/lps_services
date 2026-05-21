/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Controller, Post, Body, UseGuards, Request, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { CratePaymentDTO } from '../dto/payments/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('PAYMENTS_SERVICE') private paymentsClient: ClientProxy,
    @Inject('LOGS_SERVICE') private logsClient: ClientProxy,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('crear_pago')
  async createPayment(@Body() body: CratePaymentDTO, @Request() req: any) {
    const user = req.user;
    console.log(user); // { id: 5, name: 'Admin', email: 'admin@cobradores.com' }

    try {
      const observable = this.paymentsClient.send(
        { cmd: 'create_payment' },
        { user, data: body },
      );
      const result = await lastValueFrom(observable.pipe(timeout(5000)));
      return result;
    } catch (err: any) {
      this.logsClient.emit('log.error', {
        token: req.headers.authorization,
        data: {
          microservice: 'payments',
          endpoint: '/payments/crear_pago',
          message: err?.message || 'Error desconocido',
          stack: err?.stack,
          body: req.body,
          headers: req.headers,
        },
      });
      throw new HttpException(err?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
