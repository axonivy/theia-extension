import URI from "@theia/core/lib/common/uri";
import { FileStatNode } from "@theia/filesystem/lib/browser/file-tree/file-tree";
import { FileTreeLabelProvider } from "@theia/filesystem/lib/browser/file-tree/file-tree-label-provider";
import { injectable,  } from "inversify";

@injectable()
export class LabelExtensionLabelProviderContribution extends FileTreeLabelProvider {
    
    canHandle(element: object): number {
        if (FileStatNode.is(element)) {
            let node = element.fileStat;
            //let uri = new URI(element.fileStat.uri);
            let isIar = 0;
            if (node.isDirectory)
            {
                node.children?.forEach(file => {
                    if (new URI(file.uri).path.base === 'pom.xml') {
                        isIar = super.canHandle(element)+1;
                    }
                });
            }
            /*if (uri.path.ext === '.my') {
                return super.canHandle(element)+1;
            }*/
            return isIar;
        }
        return 0;
    }

    getIcon(): string {
        return 'iar-project-icon';
    }

    getName(fileStatNode: FileStatNode): string {
        return super.getName(fileStatNode) + ' (Ivy Project)';
    }
}
