import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Usage: pnpm generate <module-name>');
  process.exit(1);
}

const pascal = moduleName
  .split('-')
  .map((s) => s[0].toUpperCase() + s.slice(1))
  .join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const kebab = moduleName.toLowerCase();

const baseDir = path.resolve(__dirname, '../apps/internal/src', kebab);

if (fs.existsSync(baseDir)) {
  console.error(`Module "${kebab}" already exists at ${baseDir}`);
  process.exit(1);
}

const files: Record<string, string> = {};

// ─── Domain ───

files[`domain/${kebab}.entity.ts`] = `\
export class ${pascal}Entity {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Create${pascal}Data = Pick<${pascal}Entity, 'name'>;
export type Update${pascal}Data = Partial<Create${pascal}Data>;
`;

files[`domain/${kebab}.repository.ts`] = `\
import {
  ${pascal}Entity,
  Create${pascal}Data,
  Update${pascal}Data,
} from './${kebab}.entity';
import { CursorMeta } from '@app/common';

export interface ${pascal}Filter {
  search?: string;
  isActive?: boolean;
  sort?: string;
  sortOrder?: 1 | -1;
  cursor?: string;
  take?: number;
  direction?: 'next' | 'prev';
}

export abstract class I${pascal}Repository {
  abstract findById(id: string): Promise<${pascal}Entity | null>;
  abstract findAll(
    filter: ${pascal}Filter,
  ): Promise<{ data: ${pascal}Entity[]; meta: CursorMeta }>;
  abstract create(data: Create${pascal}Data): Promise<${pascal}Entity>;
  abstract update(
    id: string,
    data: Update${pascal}Data,
  ): Promise<${pascal}Entity | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract toggleActive(id: string): Promise<${pascal}Entity | null>;
}
`;

files[`domain/${kebab}.service.ts`] = `\
import { Injectable, NotFoundException } from '@nestjs/common';
import { I${pascal}Repository } from './${kebab}.repository';
import { Create${pascal}Data, Update${pascal}Data } from './${kebab}.entity';

@Injectable()
export class ${pascal}Service {
  constructor(private readonly repo: I${pascal}Repository) {}

  async create(data: Create${pascal}Data) {
    return this.repo.create(data);
  }

  async update(id: string, data: Update${pascal}Data) {
    const result = await this.repo.update(id, data);
    if (!result) throw new NotFoundException('${pascal} not found');
    return result;
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    if (!result) throw new NotFoundException('${pascal} not found');
  }

  async toggleActive(id: string) {
    const result = await this.repo.toggleActive(id);
    if (!result) throw new NotFoundException('${pascal} not found');
    return result;
  }
}
`;

// ─── Infrastructure ───

files[`infrastructure/schemas/${kebab}.schema.ts`] = `\
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ${pascal}Document = HydratedDocument<${pascal}> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, strict: true })
export class ${pascal} {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive?: boolean;
}

export const ${pascal}Schema = SchemaFactory.createForClass(${pascal});
${pascal}Schema.index({ name: 1 });
`;

files[`infrastructure/repositories/${kebab}.repository.ts`] = `\
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { ${pascal}, ${pascal}Document } from '../schemas/${kebab}.schema';
import {
  I${pascal}Repository,
  ${pascal}Filter,
} from '../../domain/${kebab}.repository';
import { ${pascal}Entity } from '../../domain/${kebab}.entity';
import { buildCursorPagination, escapeRegex, CursorMeta } from '@app/common';

@Injectable()
export class Mongo${pascal}Repository extends I${pascal}Repository {
  constructor(
    @InjectModel(${pascal}.name)
    private readonly model: Model<${pascal}Document>,
  ) {
    super();
  }

  private toEntity(doc: any): ${pascal}Entity {
    const entity = new ${pascal}Entity();
    entity.id = doc._id.toString();
    entity.name = doc.name;
    entity.isActive = doc.isActive ?? true;
    entity.createdAt = doc.createdAt;
    entity.updatedAt = doc.updatedAt;
    return entity;
  }

  async findById(id: string): Promise<${pascal}Entity | null> {
    const doc = await this.model.findById(new Types.ObjectId(id)).lean().exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(
    filter: ${pascal}Filter,
  ): Promise<{ data: ${pascal}Entity[]; meta: CursorMeta }> {
    const mongoFilter: mongoose.QueryFilter<${pascal}Document> = {};

    if (filter.search?.trim()) {
      const search = escapeRegex(filter.search.trim());
      mongoFilter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    if (filter.isActive !== undefined) {
      mongoFilter.isActive = filter.isActive;
    }

    const sortField = filter.sort || '_id';
    const sortOrder: SortOrder = filter.sortOrder || -1;
    const isPrev = filter.direction === 'prev';
    const effectiveSortOrder = isPrev ? (-sortOrder as SortOrder) : sortOrder;
    const sortOption: Record<string, SortOrder> = {
      [sortField]: effectiveSortOrder,
      _id: effectiveSortOrder,
    };

    if (filter.cursor && Types.ObjectId.isValid(filter.cursor)) {
      mongoFilter._id =
        sortOrder === 1
          ? isPrev
            ? { $lt: new Types.ObjectId(filter.cursor) }
            : { $gt: new Types.ObjectId(filter.cursor) }
          : isPrev
            ? { $gt: new Types.ObjectId(filter.cursor) }
            : { $lt: new Types.ObjectId(filter.cursor) };
    }

    const take = filter.take && filter.take > 0 ? filter.take : 10;

    const docs = await this.model
      .find(mongoFilter)
      .sort(sortOption)
      .limit(take + 1)
      .select('-__v')
      .lean()
      .exec();

    const { data, meta } = buildCursorPagination(
      docs,
      take,
      filter.cursor,
      filter.direction,
    );

    return { data: data.map((d) => this.toEntity(d)), meta };
  }

  async create(data: { name: string }): Promise<${pascal}Entity> {
    const doc = await this.model.create(data);
    return this.toEntity(doc.toObject());
  }

  async update(
    id: string,
    data: { name?: string },
  ): Promise<${pascal}Entity | null> {
    const doc = await this.model
      .findByIdAndUpdate(new Types.ObjectId(id), data, { new: true })
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.model
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();
    return !!doc;
  }

  async toggleActive(id: string): Promise<${pascal}Entity | null> {
    const doc = await this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        [{ $set: { isActive: { $not: '$isActive' } } }],
        { new: true, updatePipeline:true },
      )
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }
}
`;

// ─── DTOs ───

files[`application/dto/create-${kebab}.dto.ts`] = `\
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Create${pascal}Dto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
`;

files[`application/dto/update-${kebab}.dto.ts`] = `\
import { PartialType } from '@nestjs/swagger';
import { Create${pascal}Dto } from './create-${kebab}.dto';

export class Update${pascal}Dto extends PartialType(Create${pascal}Dto) {}
`;

files[`application/dto/list-${kebab}.dto.ts`] = `\
import { BaseFilterCursorDto } from '@app/common';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class List${pascal}Dto extends PartialType(BaseFilterCursorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;
}
`;

// ─── Commands ───

const commands = ['create', 'update', 'delete', 'toggle'];

files[`application/commands/impl/create-${kebab}.command.ts`] = `\
import { ICommand } from '@nestjs/cqrs';
import { Create${pascal}Dto } from '../../dto/create-${kebab}.dto';

export class Create${pascal}Command implements ICommand {
  constructor(public readonly dto: Create${pascal}Dto) {}
}
`;

files[`application/commands/impl/update-${kebab}.command.ts`] = `\
import { ICommand } from '@nestjs/cqrs';
import { Update${pascal}Dto } from '../../dto/update-${kebab}.dto';

export class Update${pascal}Command implements ICommand {
  constructor(
    public readonly id: string,
    public readonly dto: Update${pascal}Dto,
  ) {}
}
`;

files[`application/commands/impl/delete-${kebab}.command.ts`] = `\
import { ICommand } from '@nestjs/cqrs';

export class Delete${pascal}Command implements ICommand {
  constructor(public readonly id: string) {}
}
`;

files[`application/commands/impl/toggle-${kebab}.command.ts`] = `\
import { ICommand } from '@nestjs/cqrs';

export class Toggle${pascal}Command implements ICommand {
  constructor(public readonly id: string) {}
}
`;

files[`application/commands/impl/index.ts`] =
  commands.map((c) => `export * from './${c}-${kebab}.command';`).join('\n') +
  '\n';

files[`application/commands/handlers/create-${kebab}.handler.ts`] = `\
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Create${pascal}Command } from '../impl';
import { ${pascal}Service } from '../../../domain/${kebab}.service';

@CommandHandler(Create${pascal}Command)
export class Create${pascal}Handler implements ICommandHandler<Create${pascal}Command> {
  constructor(private readonly service: ${pascal}Service) {}

  async execute({ dto }: Create${pascal}Command) {
    return this.service.create(dto);
  }
}
`;

files[`application/commands/handlers/update-${kebab}.handler.ts`] = `\
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Update${pascal}Command } from '../impl';
import { ${pascal}Service } from '../../../domain/${kebab}.service';

@CommandHandler(Update${pascal}Command)
export class Update${pascal}Handler implements ICommandHandler<Update${pascal}Command> {
  constructor(private readonly service: ${pascal}Service) {}

  async execute({ id, dto }: Update${pascal}Command) {
    return this.service.update(id, dto);
  }
}
`;

files[`application/commands/handlers/delete-${kebab}.handler.ts`] = `\
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Delete${pascal}Command } from '../impl';
import { ${pascal}Service } from '../../../domain/${kebab}.service';

@CommandHandler(Delete${pascal}Command)
export class Delete${pascal}Handler implements ICommandHandler<Delete${pascal}Command> {
  constructor(private readonly service: ${pascal}Service) {}

  async execute({ id }: Delete${pascal}Command) {
    await this.service.delete(id);
    return null;
  }
}
`;

files[`application/commands/handlers/toggle-${kebab}.handler.ts`] = `\
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Toggle${pascal}Command } from '../impl';
import { ${pascal}Service } from '../../../domain/${kebab}.service';

@CommandHandler(Toggle${pascal}Command)
export class Toggle${pascal}Handler implements ICommandHandler<Toggle${pascal}Command> {
  constructor(private readonly service: ${pascal}Service) {}

  async execute({ id }: Toggle${pascal}Command) {
    return this.service.toggleActive(id);
  }
}
`;

files[`application/commands/handlers/index.ts`] = `\
import { Create${pascal}Handler } from './create-${kebab}.handler';
import { Update${pascal}Handler } from './update-${kebab}.handler';
import { Delete${pascal}Handler } from './delete-${kebab}.handler';
import { Toggle${pascal}Handler } from './toggle-${kebab}.handler';

export const ${pascal}CommandsHandlers = [
  Create${pascal}Handler,
  Update${pascal}Handler,
  Delete${pascal}Handler,
  Toggle${pascal}Handler,
];
`;

files[`application/commands/index.ts`] = `\
export * from './handlers';
export * from './impl';
`;

// ─── Queries ───

files[`application/queries/impl/get-${kebab}.query.ts`] = `\
import { IQuery } from '@nestjs/cqrs';

export class Get${pascal}Query implements IQuery {
  constructor(public readonly id: string) {}
}
`;

files[`application/queries/impl/list-${kebab}s.query.ts`] = `\
import { IQuery } from '@nestjs/cqrs';
import { List${pascal}Dto } from '../../dto/list-${kebab}.dto';

export class List${pascal}sQuery implements IQuery {
  constructor(public readonly args: List${pascal}Dto) {}
}
`;

files[`application/queries/impl/index.ts`] = `\
export * from './get-${kebab}.query';
export * from './list-${kebab}s.query';
`;

files[`application/queries/handlers/get-${kebab}.handler.ts`] = `\
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Get${pascal}Query } from '../impl';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { I${pascal}Repository } from '../../../domain/${kebab}.repository';

@QueryHandler(Get${pascal}Query)
export class Get${pascal}Handler implements IQueryHandler<Get${pascal}Query> {
  constructor(private readonly repo: I${pascal}Repository) {}

  async execute({ id }: Get${pascal}Query) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const ${camel} = await this.repo.findById(id);
    if (!${camel}) throw new NotFoundException('${pascal} not found');
    return ${camel};
  }
}
`;

files[`application/queries/handlers/list-${kebab}s.handler.ts`] = `\
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { List${pascal}sQuery } from '../impl';
import { SortType } from '@app/common';
import { I${pascal}Repository } from '../../../domain/${kebab}.repository';

@QueryHandler(List${pascal}sQuery)
export class List${pascal}sHandler implements IQueryHandler<List${pascal}sQuery> {
  constructor(private readonly repo: I${pascal}Repository) {}

  async execute({ args }: List${pascal}sQuery) {
    return this.repo.findAll({
      search: args.search,
      isActive: args.is_active,
      sort: args.sort,
      sortOrder: args.sort_type === SortType.ASC ? 1 : -1,
      cursor: args.cursor,
      take: args.take,
      direction: args.direction,
    });
  }
}
`;

files[`application/queries/handlers/index.ts`] = `\
import { Get${pascal}Handler } from './get-${kebab}.handler';
import { List${pascal}sHandler } from './list-${kebab}s.handler';

export const ${pascal}QueriesHandlers = [Get${pascal}Handler, List${pascal}sHandler];
`;

files[`application/queries/index.ts`] = `\
export * from './handlers';
export * from './impl';
`;

// ─── Presentation ───

files[`presentation/${kebab}.controller.ts`] = `\
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtGuard } from '../../auth/infrastructure/guards/jwt.guard';
import { PermissionsGuard } from '../../auth/infrastructure/guards/permissions.guard';
import { Create${pascal}Dto } from '../application/dto/create-${kebab}.dto';
import { Update${pascal}Dto } from '../application/dto/update-${kebab}.dto';
import { List${pascal}Dto } from '../application/dto/list-${kebab}.dto';
import {
  Create${pascal}Command,
  Update${pascal}Command,
  Delete${pascal}Command,
  Toggle${pascal}Command,
} from '../application/commands';
import { Get${pascal}Query, List${pascal}sQuery } from '../application/queries';

@Controller('${kebab}s')
@UseGuards(JwtGuard, PermissionsGuard)
@ApiTags('${pascal}s')
@ApiBearerAuth()
export class ${pascal}Controller {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@Query() args: List${pascal}Dto) {
    return this.queryBus.execute(new List${pascal}sQuery(args));
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.queryBus.execute(new Get${pascal}Query(id));
  }

  @Post()
  create(@Body() dto: Create${pascal}Dto) {
    return this.commandBus.execute(new Create${pascal}Command(dto));
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.commandBus.execute(new Toggle${pascal}Command(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Update${pascal}Dto) {
    return this.commandBus.execute(new Update${pascal}Command(id, dto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new Delete${pascal}Command(id));
  }
}
`;

// ─── Module ───

files[`${kebab}.module.ts`] = `\
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ${pascal}, ${pascal}Schema } from './infrastructure/schemas/${kebab}.schema';
import { I${pascal}Repository } from './domain/${kebab}.repository';
import { Mongo${pascal}Repository } from './infrastructure/repositories/${kebab}.repository';
import { ${pascal}Service } from './domain/${kebab}.service';
import { ${pascal}CommandsHandlers } from './application/commands';
import { ${pascal}QueriesHandlers } from './application/queries';
import { ${pascal}Controller } from './presentation/${kebab}.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ${pascal}.name, schema: ${pascal}Schema }]),
  ],
  controllers: [${pascal}Controller],
  providers: [
    { provide: I${pascal}Repository, useClass: Mongo${pascal}Repository },
    ${pascal}Service,
    ...${pascal}CommandsHandlers,
    ...${pascal}QueriesHandlers,
  ],
})
export class ${pascal}Module {}
`;

// ─── Write all files ───

let count = 0;
for (const [relativePath, content] of Object.entries(files)) {
  const filePath = path.join(baseDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  count++;
}

console.log(`Generated ${count} files in ${baseDir}`);
console.log(`\nNext steps:`);
console.log(`  1. Edit entity fields: ${kebab}/domain/${kebab}.entity.ts`);
console.log(
  `  2. Edit schema props:  ${kebab}/infrastructure/schemas/${kebab}.schema.ts`,
);
console.log(`  3. Edit DTOs:          ${kebab}/application/dto/`);
console.log(
  `  4. Register in app.module.ts: import { ${pascal}Module } from './${kebab}/${kebab}.module';`,
);
