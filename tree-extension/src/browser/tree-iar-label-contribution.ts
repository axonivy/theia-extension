import URI from "@theia/core/lib/common/uri";
import { FileStatNode, DirNode } from "@theia/filesystem/lib/browser/file-tree/file-tree";
import { FileTreeLabelProvider } from "@theia/filesystem/lib/browser/file-tree/file-tree-label-provider";
import { injectable } from "inversify";

@injectable()
export class LabelExtensionLabelProviderContribution extends FileTreeLabelProvider {

    canHandle(element: object): number {
        if (DirNode.is(element)) {
            let isIar = 0;
            let node = element.fileStat;
            node.children?.forEach(file => {
                if (new URI(file.uri).path.base === 'pom.xml') {
                    isIar = super.canHandle(element)+1;
                }
            });
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
