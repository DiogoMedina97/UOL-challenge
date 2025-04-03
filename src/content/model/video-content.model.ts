import * as path from 'path'
import { ProvisionDto } from 'src/content/dto'
import { ContentType } from 'src/content/enum'
import { BaseContent } from 'src/content/model'

export class VideoContent extends BaseContent {
  toDto(): ProvisionDto {
    return {
      ...this.content,
      type: ContentType.VIDEO,
      url: this.url,
      allow_download: false,
      is_embeddable: true,
      format: path.extname(this.url || '').slice(1) || 'mp4',
      bytes: this.bytes,
      metadata: { duration: Math.floor(this.bytes / 100000) || 10, resolution: '1080p' },
    }
  }
}
