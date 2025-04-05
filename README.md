## Setup do projeto de backend

### Pré-requisitos

O que você precisa para configurar o projeto:

- [NPM](https://www.npmjs.com/)
- [Node](https://nodejs.org/en/) `>=22.0.0` (Instale usando [NVM](https://github.com/nvm-sh/nvm))
- [Docker Compose](https://docs.docker.com/compose/)

### Setup

1. **Instale o Docker e o Docker Compose**, caso ainda não tenha.
2. Suba os serviços necessários (PostgreSQL e Redis) com:
   ```bash
   docker-compose up -d
   ```
3. Instale as dependências do projeto:
   ```bash
   nvm use && npm install
   ```
4. Configure o banco de dados:
   ```bash
   npm run db:migrate && npm run db:seed
   ```
5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```
6. Acesse o **Playground do GraphQL**:
   - 👉 [http://localhost:3000/graphql](http://localhost:3000/graphql)

### Tests

Para rodar os testes:

```bash
npm run test
```

### Migrations

Caso precise criar novas migrations, utilize o comando:

```bash
npm run db:create_migration --name=create-xpto-table
```

### Decisões técnicas

1. Estrutura baseada em domínio
   A estrutura do projeto foi mantida com base nos princípios do DDD (Domain-Driven Design), separando as responsabilidades em:

   - `model`: Entidades de domínio.
   - `dto:` Objetos de transferência de dados.
   - `enum`: Enumerações para tipos de conteúdo.
   - `repository`: Repositório simulado de conteúdos.
   - `service`: Camada de lógica de negócio.

2. Testes unitários abrangentes

   Todos os tipos de conteúdo foram testados com cenários positivos e negativos. Testes adicionais foram criados para casos específicos, como links com `http` vs `https` (URLs confiáveis ou não).

3. Validação de tipo embutida

   Utilizei a enumeração `ContentType` para garantir que apenas tipos de conteúdo válidos sejam tratados. Isso evita a necessidade de checagens manuais desnecessárias.

### Melhorias implementadas

1. Testes para `LinkContent`

   Adicionei testes completos para validar se uma URL é considerada confiável (`trusted`) com base no prefixo (`https`).

2. Padronização de retorno

   Todos os métodos `toDto()` foram ajustados para garantir consistência no formato de saída, independentemente do tipo de conteúdo.

3. Correção de falha crítica

   Foi encontrada e corrigida uma falha no arquivo `content.repository.ts`, onde a busca por conteúdo era feita com uma query SQL bruta:

   ```ts
   const [content] = await this.dataSource.query<Content[]>(
      `SELECT * FROM contents WHERE id = '${contentId}' AND deleted_at IS NULL LIMIT 1`,
   )
   ```

   Essa abordagem era vulnerável a SQL Injection. Substituí por uma consulta segura utilizando TypeORM:

   ```ts
   return this.contentRepository.findOne({
      where: {
         id: contentId,
         deleted_at: IsNull(),
      },
   })
   ```

   Essa mudança melhora a segurança da aplicação e segue as boas práticas do ORM.

### Como adicionar um novo tipo de conteúdo (provision)

Para adicionar um novo tipo de conteúdo (por exemplo, `AUDIO`):

1. Adicione um novo tipo no enum

   Arquivo: `src/content/enum/content.enum.ts`

   ```ts
   export enum ContentType {
      VIDEO = 'video',
      PDF = 'pdf',
      LINK = 'link',
      IMAGE = 'image',
      AUDIO = 'audio', // novo tipo
   }
   ```

2. Crie a classe do novo conteúdo

   Arquivo: `src/content/model/audio-content.ts` (exemplo)

   ```ts
   import { ProvisionDto } from 'src/content/dto'
   import { ContentType } from 'src/content/enum'
   import { BaseContent } from 'src/content/model'

   export class AudioContent extends BaseContent {
      toDto(): ProvisionDto {
         return {
            ...this.content,
            type: ContentType.AUDIO,
            url: this.url,
            allow_download: false,
            is_embeddable: true,
            format: this.getUrlExt('mp3'),
            bytes: this.bytes,
            metadata: { duration: Math.floor(this.bytes / 100000) || 10 },
         }
      }
   }
   ```

3. Registre o novo tipo no content factory

   Arquivo: `src/content/factory/content.factory.ts`

   ```ts
   switch (type) {
      case ContentType.PDF:
         return new PdfContent(content, url, bytes)
      case ContentType.IMAGE:
         return new ImageContent(content, url, bytes)
      case ContentType.VIDEO:
         return new VideoContent(content, url, bytes)
      case ContentType.LINK:
         return new LinkContent(content, url, bytes)
      case ContentType.TEXT:
         return new TextContent(content, url, bytes)
      case ContentType.AUDIO: // novo tipo
         return new AudioContent(content, url, bytes)
      default:
         return null
   }
   ```

4. Adicione testes unitários

   Crie um novo teste no arquivo de testes existente ou adicione um novo para validar o comportamento de AudioContent.
