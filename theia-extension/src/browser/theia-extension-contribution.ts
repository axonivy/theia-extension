import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService, MAIN_MENU_BAR } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { TerminalWidget } from "@theia/terminal/lib/browser/base/terminal-widget";
import { TerminalWidgetFactoryOptions } from '@theia/terminal/lib/browser/terminal-widget-impl';

export namespace AxonIvyCommands {
    export const Deploy = {
        id: 'Deploy.to.engine',
        label: 'Deploy to engine',
        iconClass: 'fa fa-upload'
    }

    export const Start = {
        id: 'Start.engine',
        label: 'Start engine',
        iconClass: 'fa fa-play'
    };

    export const Stop = {
        id: 'Stop.engine',
        label: 'Stop engine',
        iconClass: 'fa fa-stop'
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
        registry.registerCommand(AxonIvyCommands.Deploy, {
            execute: () => this.openTerminal("Deploy to engine",
                "mvn -Dmaven.test.skip=true -Divy.engine.directory=$IVY_HOME package && \n\
                mkdir theia-app && \n\
                find -iname '*.iar' -exec cp {} theia-app \\; && \n\
                zip -j theia-app.zip theia-app/* && \n\
                rm -r theia-app && \n\
                mv theia-app.zip $IVY_HOME/deploy/; \n",
                "Build projects and deploy them to the engine")
        });
        registry.registerCommand(AxonIvyCommands.Start, {
          execute: () => this.openTerminal("Axon.ivy Engine",
              "$IVY_HOME/bin/AxonIvyEngine\n",
              "Start Axon.ivy Engine...")
        });
        registry.registerCommand(AxonIvyCommands.Stop, {
            execute: () => this.openTerminal("Axon.ivy Engine",
                "shutdown\n",
                "Stop Axon.ivy Engine...")
        });
    }

    async openTerminal(terminalTitle: string, command: string, info: string): Promise<void> {
        this.terminal = this.terminalService.all.find(t => t.title.label == terminalTitle)
        if (!this.terminal) {
            this.terminal = <TerminalWidget>await this.terminalService.newTerminal(<TerminalWidgetFactoryOptions>{
                created: new Date().toString(),
                title: terminalTitle,
                useServerTitle: false,
                destroyTermOnClose: true
            });
            await this.terminal.start();
        }
        this.terminalService.open(this.terminal);
        this.terminal.sendText(command);
        this.messageService.info(info)
    }
}

@injectable()
export class TheiaExtensionMenuContribution implements MenuContribution {

    AXONIVY = [...MAIN_MENU_BAR, '8_axonivy'];
    DEPLOY = [...this.AXONIVY, '1_deploy'];
    ENGINE = [...this.AXONIVY, '2_engine'];

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.FILE_NEW, {
            commandId: AxonIvyCommands.NewProject.id,
            label: AxonIvyCommands.NewProject.label
        });
        menus.registerSubmenu(this.AXONIVY, 'Axon Ivy');
        menus.registerMenuAction(this.DEPLOY, {
            commandId: AxonIvyCommands.Deploy.id,
            label: AxonIvyCommands.Deploy.label
        })
        menus.registerMenuAction(this.ENGINE, {
            commandId: AxonIvyCommands.Start.id,
            label: AxonIvyCommands.Start.label
        });
        menus.registerMenuAction(this.ENGINE, {
            commandId: AxonIvyCommands.Stop.id,
            label: AxonIvyCommands.Stop.label
        });
    }
}
