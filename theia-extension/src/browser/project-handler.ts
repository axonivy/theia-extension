import { WorkspaceCommandContribution, WorkspaceService } from "@theia/workspace/lib/browser";
import { CommandRegistry, MenuContribution, MenuModelRegistry, CommandContribution } from "@theia/core/lib/common";
import { AXONIVYCATEGORY } from "./theia-extension-contribution";
import { injectable, inject } from "inversify";
import { CommonMenus, SingleTextInputDialog } from "@theia/core/lib/browser";
import URI from '@theia/core/lib/common/uri';
import { FileSystemUtils } from "@theia/filesystem/lib/common";

export const NEW_PROJECT = {
    id: 'New.Project',
    category: AXONIVYCATEGORY,
    label: 'New Project'
}

@injectable()
export class IvyProjectCommandContribution extends WorkspaceCommandContribution implements CommandContribution {
    
    constructor(
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService, 
    ) {
        super()
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(NEW_PROJECT, {
            //isEnabled: () => this.workspaceService.isMultiRootWorkspaceEnabled,
            execute: () => {
                const root = this.workspaceService.tryGetRoots()[0];
                if (root) {
                    const rootUri = new URI(root.uri);
                    const vacantChildUri = FileSystemUtils.generateUniqueResourceURI(rootUri, root, 'Untitled');
                    const dialog = new SingleTextInputDialog({
                        title: 'New Project',
                        initialValue: vacantChildUri.path.base,
                        validate: name => this.validateFileName(name, root, true)
                    });
                    dialog.open().then(name => {
                        if (name) {
                            this.newProject(rootUri, rootUri.resolve(name).toString());
                        }
                    });
                }
            }
        });
    }

    public newProject(uri: URI, name: string) {
        this.fileSystem.copy(uri.resolve('project-template').toString(), name);
    }
}

@injectable()
export class IvyProjectMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.FILE_NEW, {
            commandId: NEW_PROJECT.id,
            label: NEW_PROJECT.label
        });
    }
}
