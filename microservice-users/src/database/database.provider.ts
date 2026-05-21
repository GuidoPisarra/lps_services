/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createConnection, Connection } from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MySQLProvider implements OnModuleInit {
  private connection: Connection;

  async onModuleInit() {
    this.connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306', 10),
    });

    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        email    VARCHAR(255) NOT NULL UNIQUE,
        name     VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    console.log('✅ Conectado a MySQL/MariaDB correctamente');
  }

  getConnection() {
    return this.connection;
  }
}
