import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/users.repository-pg';
import { UtilsService } from '../../utils/utils.service';

export class ResendEmailCommand {
  constructor(public email: string) { }
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    private usersRepo: UsersRepository,
    private utilsService: UtilsService,
  ) { }

  async execute(command: ResendEmailCommand) {
    const user = await this.usersRepo.getUserByLoginOrEmail(command.email);
    if (!user) {
      throw new BadRequestException('invalid email');
    }
    if (user.emailConfirmation.isConfirmed === true) {
      throw new BadRequestException('invalid email');
    }

    const newCode = await this.usersRepo.newConfirmationCode(user.id)
    await this.utilsService.sendConfirmationViaEmail(user.email, newCode);
    return;
  }
}
