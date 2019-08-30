import { WorkspaceCommandContribution, WorkspaceService, WorkspacePreferences, WorkspaceCommands } from "@theia/workspace/lib/browser";
import { CommandRegistry, MenuContribution, MenuModelRegistry, CommandContribution } from "@theia/core/lib/common";
import { AXONIVYCATEGORY } from "./theia-extension-contribution";
import { injectable, inject } from "inversify";
import { CommonMenus, SingleTextInputDialog } from "@theia/core/lib/browser";
import URI from '@theia/core/lib/common/uri';
import { FileSystemUtils } from "@theia/filesystem/lib/common";
import { OpenFileDialogProps } from "@theia/filesystem/lib/browser";

export const NEW_PROJECT = {
    id: 'New.Project',
    category: AXONIVYCATEGORY,
    label: 'New Project'
}

@injectable()
export class IvyProjectCommandContribution extends WorkspaceCommandContribution implements CommandContribution {
    
    constructor(
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService, 
        @inject(WorkspacePreferences) protected readonly preferences: WorkspacePreferences,
    ) {
        super()
    }

    registerCommands(registry: CommandRegistry): void {
        this.preferences.ready.then(() => {
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
            /*registry.registerCommand(NEW_PROJECT, {
                execute: async () => {
                    const uri = await this.fileDialogService.showOpenDialog({
                        title: 'New Project location'!,
                        canSelectFiles: false,
                        canSelectFolders: true },
                        this.workspaceService.workspace
                    );
                    if (uri) {
                        let uriFileStat = this.getDirectory(uri);
                        if (uriFileStat) {
                            const dialog = new SingleTextInputDialog({
                                title: 'New Project',
                                initialValue: 'new-project',
                                //validate: name => this.validateFileName(name, uriFileStat, true)
                            }).open().then(name => this.addNewProject(uri, name))
                        }
                    }
                }
            });*/
        });
    }

    /*async addNewProject(uri: URI, name: string) {
        await this.addFolderToWorkspace(uri.resolve(name));
        const saveCommand = registry.getCommand(WorkspaceCommands.SAVE_WORKSPACE_AS.id);
        if (saveCommand && await new ConfirmDialog({
            title: 'Folder added to Workspace',
            msg: 'A workspace with multiple roots was created. Do you want to save your workspace configuration as a file?',
            ok: 'Yes',
            cancel: 'No'
        }).open()) {
            registry.executeCommand(saveCommand.id);
        }
    }*/

    private newProject(uri: URI, name: string) {
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
