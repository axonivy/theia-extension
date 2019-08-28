import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService, MAIN_MENU_BAR } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { TerminalWidget } from "@theia/terminal/lib/browser/base/terminal-widget";
import { TerminalWidgetFactoryOptions } from '@theia/terminal/lib/browser/terminal-widget-impl';

export namespace AxonIvyCommands {
    export const Start = {
        id: 'Start.engine',
        label: 'Start engine'
    };

    export const Stop = {
        id: 'Stop.engine',
        label: 'Stop engine'
    };

    export const NewProject = {
        id: 'New.project',
        label: 'New Project'
    }
}

@injectable()
export class TheiaExtensionCommandContribution implements CommandContribution {

    terminal: TerminalWidget | undefined;

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
        @inject(TerminalService) protected readonly terminalService: TerminalService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(AxonIvyCommands.NewProject, {
            execute: () => this.messageService.info('Hello World!')
        });
        registry.registerCommand(AxonIvyCommands.Start, {
            execute: () => this.openTerminal("mvn com.axonivy.ivy.ci:project-build-plugin:7.4.0-SNAPSHOT:installEngine \
              -Divy.engine.list.url=http://zugprojenkins/job/ivy-core_product/job/master/lastSuccessfulBuild/ \
              -Divy.engine.directory=./.ivy-engine \n \
              .ivy-engine/bin/AxonIvyEngine \n", "Start engine...")
        });
        registry.registerCommand(AxonIvyCommands.Stop, {
            execute: () => this.openTerminal("shutdown\n", "Stop engine...")
        });
    }

    async openTerminal(command: string, info: string): Promise<void> {
        if (!this.terminal) {
            this.terminal = <TerminalWidget>await this.terminalService.newTerminal(<TerminalWidgetFactoryOptions>{ 
                created: new Date().toString(),
                title: "Axon Ivy Engine",
                useServerTitle: false,
                destroyTermOnClose: true
            });
            await this.terminal.start();
        }
        this.terminalService.activateTerminal(this.terminal);
        this.terminal.sendText(command);
        this.messageService.info(info)
    }
}

@injectable()
export class TheiaExtensionMenuContribution implements MenuContribution {

    AXONIVY = [...MAIN_MENU_BAR, '8_axonivy'];

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.FILE_NEW, {
            commandId: AxonIvyCommands.NewProject.id,
            label: AxonIvyCommands.NewProject.label
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