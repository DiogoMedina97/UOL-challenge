import * as path from 'path'
import { ProvisionDto } from 'src/content/dto'
import { ContentType } from 'src/content/enum'
import { BaseContent } from 'src/content/model'

export class ImageContent extends BaseContent {
  toDto(): ProvisionDto {
    return {
      ...this.content,
      type: ContentType.IMAGE,
      url: this.url,
      allow_download: true,
      is_embeddable: true,
      format: path.extname(this.url || '').slice(1) || 'jpg',
      bytes: this.bytes,
      metadata: { resolution: '1920x1080', aspect_ratio: '16:9' },
    }
  }
}
