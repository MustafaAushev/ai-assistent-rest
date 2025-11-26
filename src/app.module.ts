import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConversationsService } from './conversation.service';
import { PG } from './const';
import { Client } from 'pg';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    ConversationsService,
    {
      provide: PG,
      useFactory: async () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const client = new Client(process.env.DB_URL!);
        await client.connect();
        await client.query(/* sql */ `;`);
        return client;
      },
    },
  ],
})
export class AppModule {}
