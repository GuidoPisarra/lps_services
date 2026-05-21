/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validKey = this.config.get<string>('LOG_API_KEY');

    if (!validKey) {
      throw new UnauthorizedException('LOG_API_KEY no configurada en el servidor');
    }
    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('API Key inválida o ausente');
    }
    return true;
  }
}