import * as path from 'path'
import { ProvisionDto } from 'src/content/dto'
import { ContentType } from 'src/content/enum'
import { BaseContent } from 'src/content/model'

export class TextContent extends BaseContent {
  toDto(): ProvisionDto {
    return {
      ...this.content,
      type: ContentType.TEXT,
      url: this.url,
      allow_download: true,
      is_embeddable: false,
      format: path.extname(this.url || '').slice(1) || 'txt',
      bytes: this.bytes,
      metadata: { enconding: 'UTF-8' },
    }
  }
}
