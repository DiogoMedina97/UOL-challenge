import { ProvisionDto } from 'src/content/dto'
import { ContentType } from 'src/content/enum'
import { BaseContent } from 'src/content/model'

export class LinkContent extends BaseContent {
  toDto(): ProvisionDto {
    return {
      ...this.content,
      type: ContentType.LINK,
      url: this.url || 'http://default.com',
      allow_download: false,
      is_embeddable: true,
      format: null,
      bytes: 0,
      metadata: { trusted: this.url.includes('https') || false },
    }
  }
}
