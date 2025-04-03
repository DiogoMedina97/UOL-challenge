import { ProvisionDto } from 'src/content/dto'
import { ContentType } from 'src/content/enum'
import { BaseContent } from 'src/content/model'

export class PdfContent extends BaseContent {
  toDto(): ProvisionDto {
    return {
      ...this.content,
      type: ContentType.PDF,
      url: this.url,
      allow_download: true,
      is_embeddable: false,
      format: 'pdf',
      bytes: this.bytes,
      metadata: {
        author: 'Unknown',
        pages: Math.floor(this.bytes / 50000) || 1,
        encrypted: false,
      },
    }
  }
}
