/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MySQLProvider } from 'src/database/database.provider';

@Injectable()
export class PaymentRepository implements OnModuleInit {
  constructor(private readonly mysqlProvider: MySQLProvider) { }

  async onModuleInit() {
    const conn = this.mysqlProvider.getConnection();
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS Payments (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        userId      VARCHAR(255)   NOT NULL,
        userEmail   VARCHAR(255)   NOT NULL,
        amount      DECIMAL(10,2)  NOT NULL,
        concept     VARCHAR(500)   NOT NULL,
        referencia  VARCHAR(50)    NOT NULL UNIQUE,
        status      VARCHAR(50)    NOT NULL DEFAULT 'processed',
        createdAt   DATETIME       DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async createPayment(
    userId: string,
    userEmail: string,
    amount: number,
    concept: string,
    referencia: string,
  ) {
    const conn = this.mysqlProvider.getConnection();
    const [result]: any = await conn.execute(
      `INSERT INTO Payments (userId, userEmail, amount, concept, referencia)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, userEmail, amount, concept, referencia],
    );
    return { id: result.insertId, userId, userEmail, amount, concept, referencia };
  }
}
