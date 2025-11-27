import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  Conversation,
  ConversationPreview,
  ConversationsService,
  ConversationStats,
} from './conversation.service';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

class FilterDto {
  @ApiProperty()
  success?: string;
}

@Controller()
@ApiTags('Conversations')
export class AppController {
  constructor(private readonly svc: ConversationsService) {}

  @Get('conversations')
  @ApiResponse({
    status: 200,
    description: 'Get conversations',
    type: ConversationPreview,
  })
  async conversations(
    @Query() { success }: FilterDto,
  ): Promise<ConversationPreview[]> {
    return this.svc.getConversations({
      success:
        success === 'true' ? true : success === 'false' ? false : undefined,
    });
  }

  @Get('conversations/:id')
  @ApiResponse({
    status: 200,
    description: 'Get conversations',
    type: Conversation,
  })
  async conversation(@Param('id') id: string): Promise<Conversation> {
    return this.svc.getConversation(id);
  }

  @Get('stats')
  @ApiResponse({
    status: 200,
    description: 'Get stats',
    type: ConversationStats,
  })
  async stats(): Promise<ConversationStats> {
    return this.svc.stats();
  }
}
