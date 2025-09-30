import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  async healthCheck(@Req() req: Request) {
    return this.productsService.healthCheck(req.headers);
  }
}
