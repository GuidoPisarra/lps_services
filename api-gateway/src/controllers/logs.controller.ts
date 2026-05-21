/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, UseGuards, Inject, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { IngestLogDTO } from '../dto/logs/ingest-log.dto';

@Controller('logs')
export class LogsController {
  constructor(
    @Inject('LOGS_SERVICE') private logsClient: ClientProxy,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getLogs() {
    return lastValueFrom(
      this.logsClient.send({ cmd: 'get.logs' }, {}).pipe(timeout(5000)),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('ingest')
  async ingestLog(@Body() body: IngestLogDTO, @Req() req: any) {
    this.logsClient.emit('log.external', {
      system: body.system,
      action: body.action,
      level: body.level || 'error',
      message: body.message,
      data: body.data,
      ip: req.ip,
    });
    return { ok: true, message: 'Log recibido' };
  }
}