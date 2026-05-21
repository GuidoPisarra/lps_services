/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';

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
}
