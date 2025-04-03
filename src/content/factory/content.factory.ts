import { Content } from 'src/content/entity'
import { ContentType } from 'src/content/enum/content.enum'
import { BaseContent, ImageContent, LinkContent, PdfContent, VideoContent } from 'src/content/model'

export class ContentFactory {
  static createContent(
    type: ContentType,
    content: Content,
    url: string,
    bytes: number,
  ): BaseContent | null {
    switch (type) {
      case ContentType.PDF:
        return new PdfContent(content, url, bytes)
      case ContentType.IMAGE:
        return new ImageContent(content, url, bytes)
      case ContentType.VIDEO:
        return new VideoContent(content, url, bytes)
      case ContentType.LINK:
        return new LinkContent(content, url, bytes)
      default:
        return null
    }
  }
}
