import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService, MAIN_MENU_BAR } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";

export const TheiaExtensionHelloCommand = {
    id: 'TheiaExtension.hellocommand',
    label: "Shows a message"
};

export namespace AxonIvyCommands {
    export const Start = {
        id: 'Start.engine',
        label: 'Start engine'
    };

    export const Stop = {
        id: 'Stop.engine',
        label: 'Stop engine'
    }
}

@injectable()
export class TheiaExtensionCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TheiaExtensionHelloCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
        registry.registerCommand(AxonIvyCommands.Start, {
            execute: () => this.messageService.info('Start engine')
        });
        registry.registerCommand(AxonIvyCommands.Stop, {
            execute: () => this.messageService.info('Stop engine')
        });
    }
}

@injectable()
export class TheiaExtensionMenuContribution implements MenuContribution {

    AXONIVY = [...MAIN_MENU_BAR, '8_axonivy'];

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: TheiaExtensionHelloCommand.id,
            label: 'Say Hello'
        });
        menus.registerSubmenu(this.AXONIVY, 'Axon Ivy');
        menus.registerMenuAction(this.AXONIVY, {
            commandId: AxonIvyCommands.Start.id,
            label: AxonIvyCommands.Start.label
        });
        menus.registerMenuAction(this.AXONIVY, {
            commandId: AxonIvyCommands.Stop.id,
            label: AxonIvyCommands.Stop.label
        });
    }
}