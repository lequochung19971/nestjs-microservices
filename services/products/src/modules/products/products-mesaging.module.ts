// import { DynamicModule, Global, Module } from '@nestjs/common';
// import { ProductsConsumers } from './products-consumers';
// import { ProductsPublishers } from './products-publishers';
// import { RabbitMQService } from 'nest-shared/rabbitmq';
// import { ProductsService } from './products.service';

// @Global()
// @Module({})
// export class ProductsMessagingModule {
//   static forRoot(): DynamicModule {
//     return {
//       module: ProductsMessagingModule,
//       providers: [
//         ProductsConsumers,
//         ProductsPublishers,
//         RabbitMQService,
//         ProductsService,
//       ],
//       exports: [ProductsConsumers, ProductsPublishers],
//     };
//   }
// }
