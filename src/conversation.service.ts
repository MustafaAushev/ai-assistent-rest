import { Inject, Injectable } from '@nestjs/common';
import { PG } from './const';
import { Client } from 'pg';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationStats {
  constructor(args: any) {
    Object.assign(this, args);
  }

  @ApiProperty({
    description: 'Процент удовлетворительных для пользователя ответов нейронки',
  })
  successPercent!: number;

  @ApiProperty()
  successTotal!: number;

  @ApiProperty({
    description:
      'Процент неудовлетворительных для пользователя ответов нейронки',
  })
  failedTotal!: number;

  @ApiProperty()
  failedPercent!: number;

  @ApiProperty()
  total!: number;
}

export class Conversation {
  constructor(args: any) {
    Object.assign(this, args);
  }

  @ApiProperty()
  id!: string;
  @ApiProperty()
  username!: string;
  @ApiProperty()
  question!: string;
  @ApiProperty()
  contextChunks!: { id: string; text: string }[];
  @ApiProperty()
  llmResponse!: string;
  @ApiProperty({
    description: 'Нашла ли нейронка ответ в контексте документации',
  })
  success!: boolean;
  @ApiProperty({
    description: 'Удовлетворил ли пользователя ответ нейронки',
  })
  feedback?: boolean;
  @ApiProperty()
  avgContextScore!: number;
}

export class ConversationFilter {
  success?: boolean;
}

@Injectable()
export class ConversationsService {
  constructor(@Inject(PG) private readonly pg: Client) {}

  async getConversations(filter: ConversationFilter): Promise<Conversation[]> {
    let sql = /* sql */ `
      SELECT * FROM conversations
      WHERE 1=1
    `;
    const parameters: boolean[] = [];
    if (filter.success === true || filter.success === false) {
      sql += /* sql */ `
        AND success = $1
      `;
      parameters.push(filter.success);
    }

    const result = await this.pg.query<{
      id: string;
      user_name: string;
      question: string;
      llm_response: string;
      context_chunks: { id: string; text: string }[];
      success: boolean;
      feedback?: string;
      avg_context_score: number;
    }>(sql, parameters);

    const conversations = result.rows;

    return conversations.map(
      (r) =>
        new Conversation({
          id: r.id,
          username: r.user_name,
          question: r.question,
          contextChunks: r.context_chunks,
          llmResponse: r.llm_response,
          success: r.success,
          feedback: r.feedback,
          avgContextScore: r.avg_context_score,
        }),
    );
  }

  async stats(): Promise<ConversationStats> {
    const { rows } = await this.pg.query<{ count: number; feedback: boolean }>(
      /* sql */ ` SELECT count(*) as count, feedback FROM conversations group by feedback`,
    );

    const successTotal = rows
      .filter((r) => r.feedback)
      .reduce((acc, cur) => acc + cur.count, 0);
    const failedTotal = rows
      .filter((r) => !r.feedback)
      .reduce((acc, cur) => acc + cur.count, 0);

    const total = rows.reduce((acc, cur) => acc + cur.count, 0);

    return new ConversationStats({
      total,
      successTotal,
      failedTotal,
    });
  }
}
