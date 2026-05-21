import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true })
  microservice: string;

  @Prop({ required: true })
  action: string;

  @Prop({ type: Object })
  body: Record<string, any>;

  @Prop()
  userId?: string;

  @Prop()
  ip?: string;

  @Prop({ default: 'error', enum: ['info', 'warning', 'error'] })
  level: string;

  @Prop({ default: 'internal', enum: ['internal', 'external'] })
  source: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);