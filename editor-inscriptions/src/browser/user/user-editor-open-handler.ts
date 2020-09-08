import { WidgetOpenHandler } from "@theia/core/lib/browser";
import { UserEditorWidget, UserEditorWidgetOptions } from "./user-editor-widget";
import URI from "@theia/core/lib/common/uri";
import { injectable, inject } from "inversify";
import { EditorManager } from "@theia/editor/lib/browser";

@injectable()
export class UserEditorOpenHandler extends WidgetOpenHandler<UserEditorWidget> {
    
    readonly id = UserEditorWidget.ID;
    readonly label = UserEditorWidget.TITLE;
    readonly iconClass = UserEditorWidget.ICON;

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    canHandle(uri: URI): number {
        if (uri.path.ext === UserEditorWidget.CAN_HANDLE) {
            return this.editorManager.canHandle(uri) * 2;
        }
        return 0;
    }

    protected createWidgetOptions(uri: URI): UserEditorWidgetOptions {
        return { uri: uri.withoutFragment().toString() };
    }
    
}