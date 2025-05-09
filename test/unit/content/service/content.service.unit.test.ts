import { Test, TestingModule } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import * as fs from 'fs'
import { ContentService } from 'src/content/service'
import { ContentRepository } from 'src/content/repository'
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Content } from 'src/content/entity'
import { ContentType } from 'src/content/enum'

@suite
export class ContentServiceUnitTest {
  private contentService: ContentService
  private contentRepository: ContentRepository

  private readonly mockContent = (type: ContentType, format?: string, url?: string): Content =>
    ({
      id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      title: `Test ${type}`,
      description: `Description for ${type}`,
      url: url || `http://localhost:3000/uploads/dummy.${format}`,
      created_at: new Date('2025-01-31T23:39:54.236Z'),
      total_likes: 10,
      type,
    }) as Content

  async before() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: ContentRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    this.contentService = module.get<ContentService>(ContentService)
    this.contentRepository = module.get<ContentRepository>(ContentRepository)
  }

  @test
  async '[provision] Should throw BadRequestException if content type is missing'() {
    const mockContentWithoutType = {
      ...this.mockContent(ContentType.PDF),
      type: undefined,
    } as any

    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(mockContentWithoutType)

    const loggerSpy = jest.spyOn(this.contentService['logger'], 'warn').mockImplementation(() => {})

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    ).rejects.toThrow(BadRequestException)

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing content type for ID=4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    )
  }

  @test
  async '[provision] Should return provisioned PDF content'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.PDF, 'pdf'))
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 50000 } as fs.Stats)

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(result).toMatchObject({
      type: ContentType.PDF,
      allow_download: true,
      is_embeddable: false,
      format: 'pdf',
      bytes: 50000,
      metadata: { author: 'Unknown', pages: 1, encrypted: false },
    })
  }

  @test
  async '[provision] Should return provisioned Image content'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.IMAGE, 'png'))
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 20000 } as fs.Stats)

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(result).toMatchObject({
      type: ContentType.IMAGE,
      allow_download: true,
      is_embeddable: true,
      format: 'png',
      bytes: 20000,
      metadata: { resolution: '1920x1080', aspect_ratio: '16:9' },
    })
  }

  @test
  async '[provision] Should return provisioned Image content with default format'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.IMAGE, ''))
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 20000 } as fs.Stats)

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(result).toMatchObject({
      type: ContentType.IMAGE,
      allow_download: true,
      is_embeddable: true,
      format: 'jpg',
      bytes: 20000,
      metadata: { resolution: '1920x1080', aspect_ratio: '16:9' },
    })
  }

  @test
  async '[provision] Should return provisioned Video content'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.VIDEO, 'avi'))
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1000000 } as fs.Stats)

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(result).toMatchObject({
      type: ContentType.VIDEO,
      allow_download: false,
      is_embeddable: true,
      format: 'avi',
      bytes: 1000000,
      metadata: { duration: 10, resolution: '1080p' },
    })
  }

  @test
  async '[provision] Should return provisioned Video content with default format'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.VIDEO, ''))
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1000000 } as fs.Stats)

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(result).toMatchObject({
      type: ContentType.VIDEO,
      allow_download: false,
      is_embeddable: true,
      format: 'mp4',
      bytes: 1000000,
      metadata: { duration: 10, resolution: '1080p' },
    })
  }

  @test
  async '[provision] Should return provisioned Link content'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.LINK, null, 'https://example.com'))

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(result).toMatchObject({
      type: ContentType.LINK,
      allow_download: false,
      is_embeddable: true,
      format: null,
      bytes: 0,
      metadata: { trusted: true },
    })
  }

  @test
  async '[provision] Should return URL as trusted (Link content)'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.LINK, null, 'https://example.com'))

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect((result.metadata as any).trusted).toBe(true)
  }

  @test
  async '[provision] Should return URL as untrusted (Link content)'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.LINK, null, 'http://example.com'))

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect((result.metadata as any).trusted).toBe(false)
  }

  @test
  async '[provision] Should return provisioned Text content'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.TEXT, 'txt'))
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1000000 } as fs.Stats)

    const result = await this.contentService.provision('ab4b0168-1c42-4890-aff3-a00e0f762079')

    expect(result).toMatchObject({
      type: ContentType.TEXT,
      allow_download: true,
      is_embeddable: false,
      format: 'txt',
      bytes: 1000000,
      metadata: { enconding: 'UTF-8' },
    })
  }

  @test
  async '[provision] Should throw UnprocessableEntityException if content ID is missing'() {
    await expect(this.contentService.provision('')).rejects.toThrow(UnprocessableEntityException)
  }

  @test
  async '[provision] Should throw NotFoundException if content is not found'() {
    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(null)

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    ).rejects.toThrow(NotFoundException)
  }

  @test
  async '[provision] Should throw NotFoundException if database query fails'() {
    jest.spyOn(this.contentRepository, 'findOne').mockRejectedValue(new Error('DB error'))

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    ).rejects.toThrow(NotFoundException)
  }

  @test
  async '[provision] Should throw BadRequestException for unsupported content type'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent('unsupported' as ContentType))

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    ).rejects.toThrow(BadRequestException)
  }

  @test
  async '[provision] Should log file system errors but not fail'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent(ContentType.PDF, 'pdf'))
    jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      throw new Error('File system error')
    })

    const loggerSpy = jest
      .spyOn(this.contentService['logger'], 'error')
      .mockImplementation(() => {})

    const result = await this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0')

    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('File system error'))
    expect(result.bytes).toBe(0)
  }
}
