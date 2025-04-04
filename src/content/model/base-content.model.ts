import * as path from 'path'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'

export abstract class BaseContent {
  constructor(
    protected content: Content,
    protected url: string,
    protected bytes: number,
  ) {}

  abstract toDto(): ProvisionDto

  getUrlExt(default_ext: string): string {
    const pathname = new URL(this.url).pathname
    const ext = path.extname(pathname).slice(1)
    return ext || default_ext
  }
}
