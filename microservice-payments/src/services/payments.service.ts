/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentRepository: PaymentRepository) { }

  async createPayment(user: any, data: any) {
    const referencia = `PAY-${Date.now()}`;

    await this.paymentRepository.createPayment(
      String(user.id),
      user.email,
      data.amount,
      data.concept,
      referencia,
    );

    return {
      ok: true,
      message: `Pago procesado correctamente para ${user.email}`,
      monto: data.amount,
      referencia,
    };
  }
}
