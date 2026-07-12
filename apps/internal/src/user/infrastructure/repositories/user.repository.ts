import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { IUserRepository, UserFilter } from '../../domain/user.repository';
import { UserEntity } from '../../domain/user.entity';
import { buildCursorPagination, escapeRegex, CursorMeta } from '@app/common';
import { RoleDocument } from '../../../role/infrastructure/schemas/role.schema';

@Injectable()
export class MongoUserRepository extends IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly model: Model<UserDocument>,
  ) {
    super();
  }

  private toEntity(doc: any): UserEntity {
    const entity = new UserEntity();
    entity.id = doc._id.toString();
    entity.email = doc.email;
    entity.username = doc.username;
    entity.password = doc.password;
    entity.isActive = doc.isActive ?? true;
    entity.createdAt = doc.createdAt;
    entity.updatedAt = doc.updatedAt;

    const role = doc.role as RoleDocument | undefined;
    entity.role =
      role && role._id
        ? {
            id: role._id.toString(),
            name: role.name,
            permissions: role.permissions || [],
          }
        : null;

    return entity;
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model
      .findById(id)
      .select('-__v')
      .populate<{ role: RoleDocument }>({
        path: 'role',
        select: '_id name permissions',
      })
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const doc = await this.model
      .findOne({ username })
      .select('-__v')
      .populate<{ role: RoleDocument }>({
        path: 'role',
        select: '_id name permissions',
      })
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(
    filter: UserFilter,
  ): Promise<{ data: UserEntity[]; meta: CursorMeta }> {
    const mongoFilter: mongoose.QueryFilter<UserDocument> = {};

    if (filter.search?.trim()) {
      const search = escapeRegex(filter.search.trim());
      mongoFilter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
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
      .select('-__v -password')
      .populate<{ role: RoleDocument }>({
        path: 'role',
        select: '_id name permissions',
      })
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
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<UserEntity> {
    const createData: any = { ...data };
    if (data.role) createData.role = new Types.ObjectId(data.role);
    const doc = await this.model.create(createData);
    return this.toEntity(doc.toObject());
  }

  async update(
    id: string,
    data: { username?: string; email?: string; role?: string },
  ): Promise<UserEntity | null> {
    const updateData: any = { ...data };
    if (data.role) updateData.role = new Types.ObjectId(data.role);
    const doc = await this.model
      .findByIdAndUpdate(new Types.ObjectId(id), updateData, { new: true })
      .populate<{ role: RoleDocument }>({
        path: 'role',
        select: '_id name permissions',
      })
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await this.model.updateOne(
      { _id: new Types.ObjectId(id) },
      { password: hashedPassword },
    );
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.model
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();
    return !!doc;
  }

  async toggleActive(id: string): Promise<UserEntity | null> {
    const doc = await this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        [{ $set: { isActive: { $not: '$isActive' } } }],
        { new: true },
      )
      .populate<{ role: RoleDocument }>({
        path: 'role',
        select: '_id name permissions',
      })
      .lean()
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async existsById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.model.exists({ _id: new Types.ObjectId(id) }).exec();
    return !!doc;
  }
}
