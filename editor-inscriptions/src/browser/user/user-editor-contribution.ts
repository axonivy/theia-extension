import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";
import { FileStatNode } from "@theia/filesystem/lib/browser/file-tree/file-tree";
import { FileTreeLabelProvider } from "@theia/filesystem/lib/browser/file-tree/file-tree-label-provider";
import URI from "@theia/core/lib/common/uri";
import { UserEditorWidget } from "./user-editor-widget";

export const UserEditorCommand = {
    id: 'UserEditor.command',
    label: "Shows a message"
};

@injectable()
export class UserEditorCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(UserEditorCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}

@injectable()
export class UserEditorMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: UserEditorCommand.id,
            label: 'Say Hello'
        });
    }
}

@injectable()
export class TestUsersLabelProviderContribution extends FileTreeLabelProvider {
    
    canHandle(element: object): number {
        if (FileStatNode.is(element)) {
            let node = element.fileStat;
            if (new URI(node.uri).path.ext === UserEditorWidget.CAN_HANDLE) {
                return super.canHandle(element)+1
            }
        }
        return 0;
    }

    getIcon(): string {
        return UserEditorWidget.ICON + ' theia-file-icons-js';
    }

    getName(fileStatNode: FileStatNode): string {
        return "Test Users";
    }
}