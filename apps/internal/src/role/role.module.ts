import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './infrastructure/schemas/role.schema';
import { IRoleRepository } from './domain/role.repository';
import { MongoRoleRepository } from './infrastructure/repositories/role.repository';
import { RoleService } from './domain/role.service';
import { RoleCommandsHandlers } from './application/commands';
import { RoleQueriesHandlers } from './application/queries';
import { RoleController } from './presentation/role.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RoleController],
  providers: [
    { provide: IRoleRepository, useClass: MongoRoleRepository },
    RoleService,
    ...RoleCommandsHandlers,
    ...RoleQueriesHandlers,
  ],
  exports: [IRoleRepository],
})
export class RoleModule {}
