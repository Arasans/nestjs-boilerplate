import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import {
  Example as ExampleModel,
  ExampleDocument,
} from '../schemas/example.schema';
import {
  IExampleRepository,
  ExampleFilter,
} from '../../domain/example.repository';
import { Example } from '../../domain/example.entity';
import { buildCursorPagination, escapeRegex, CursorMeta } from '@app/common';

@Injectable()
export class MongoExampleRepository extends IExampleRepository {
  constructor(
    @InjectModel(ExampleModel.name)
    private readonly model: Model<ExampleDocument>,
  ) {
    super();
  }

  private toEntity(doc: any): Example {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<Example | null> {
    const doc = await this.model.findById(new Types.ObjectId(id)).lean().exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(
    filter: ExampleFilter,
  ): Promise<{ data: Example[]; meta: CursorMeta }> {
    const mongoFilter: mongoose.QueryFilter<ExampleDocument> = {};

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

  async create(data: { name: string; description?: string }): Promise<Example> {
    const doc = await this.model.create(data);
    return this.toEntity(doc.toObject());
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<Example | null> {
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

  async toggleActive(id: string): Promise<Example | null> {
    const doc = await this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        [{ $set: { isActive: { $not: '$isActive' } } }],
        { new: true },
      )
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }
}
