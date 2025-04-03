import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'

export abstract class BaseContent {
  constructor(
    protected content: Content,
    protected url: string,
    protected bytes: number,
  ) {}

  abstract toDto(): ProvisionDto
}
