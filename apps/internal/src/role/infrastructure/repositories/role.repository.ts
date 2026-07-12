import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { IRoleRepository, RoleFilter } from '../../domain/role.repository';
import { RoleEntity } from '../../domain/role.entity';
import { PERMISSION } from '../../domain/permission.enum';
import { buildCursorPagination, escapeRegex, CursorMeta } from '@app/common';

@Injectable()
export class MongoRoleRepository extends IRoleRepository {
  constructor(
    @InjectModel(Role.name)
    private readonly model: Model<RoleDocument>,
  ) {
    super();
  }

  private toEntity(doc: any): RoleEntity {
    const entity = new RoleEntity();
    entity.id = doc._id.toString();
    entity.name = doc.name;
    entity.permissions = doc.permissions || [];
    entity.isPrimary = doc.isPrimary ?? false;
    entity.createdAt = doc.createdAt;
    entity.updatedAt = doc.updatedAt;
    return entity;
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const doc = await this.model.findById(new Types.ObjectId(id)).lean().exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(
    filter: RoleFilter,
  ): Promise<{ data: RoleEntity[]; meta: CursorMeta }> {
    const mongoFilter: mongoose.QueryFilter<RoleDocument> = {};

    if (filter.search?.trim()) {
      const search = escapeRegex(filter.search.trim());
      mongoFilter.$or = [{ name: { $regex: search, $options: 'i' } }];
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

  async create(data: {
    name: string;
    permissions: PERMISSION[];
  }): Promise<RoleEntity> {
    const doc = await this.model.create(data);
    return this.toEntity(doc.toObject());
  }

  async update(
    id: string,
    data: { name?: string; permissions?: PERMISSION[] },
  ): Promise<RoleEntity | null> {
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

  async togglePrimary(id: string): Promise<RoleEntity | null> {
    const doc = await this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        [{ $set: { isPrimary: { $not: '$isPrimary' } } }],
        { new: true },
      )
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }
}
