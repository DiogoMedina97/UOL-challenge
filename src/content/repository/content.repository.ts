import { Repository, IsNull } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Content } from 'src/content/entity'

@Injectable()
export class ContentRepository {
  constructor(@InjectRepository(Content) private readonly contentRepository: Repository<Content>) {}

  async findOne(contentId: string): Promise<Content | null> {
    return this.contentRepository.findOne({
      where: {
        id: contentId,
        deleted_at: IsNull(),
      },
    })
  }
}
