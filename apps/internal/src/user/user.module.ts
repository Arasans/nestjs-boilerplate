import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './infrastructure/schemas/user.schema';
import { IUserRepository } from './domain/user.repository';
import { MongoUserRepository } from './infrastructure/repositories/user.repository';
import { UserService } from './domain/user.service';
import { UserCommandsHandlers } from './application/commands';
import { UserQueriesHandlers } from './application/queries';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    { provide: IUserRepository, useClass: MongoUserRepository },
    UserService,
    ...UserCommandsHandlers,
    ...UserQueriesHandlers,
  ],
  exports: [IUserRepository],
})
export class UserModule {}
