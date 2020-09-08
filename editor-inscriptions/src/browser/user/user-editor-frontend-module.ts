import { UserEditorCommandContribution, UserEditorMenuContribution, TestUsersLabelProviderContribution } from './user-editor-contribution';
import { CommandContribution, MenuContribution } from "@theia/core/lib/common";
import { OpenHandler, WidgetFactory } from "@theia/core/lib/browser";
import { interfaces } from "inversify";
import { UserEditorWidget, UserEditorWidgetOptions } from './user-editor-widget';
import { UserEditorOpenHandler } from './user-editor-open-handler';
import { LabelProviderContribution } from "@theia/core/lib/browser";

export class UserEditorBinder {
    
    static bind(bind : interfaces.Bind) {
        bind(CommandContribution).to(UserEditorCommandContribution).inSingletonScope();
        bind(MenuContribution).to(UserEditorMenuContribution).inSingletonScope();

        bind(OpenHandler).to(UserEditorOpenHandler).inSingletonScope();
        bind(WidgetFactory).toDynamicValue(({ container }) => ({
            id: UserEditorWidget.ID,
            createWidget: (options: UserEditorWidgetOptions) => {
                const child = container.createChild();
                child.bind(UserEditorWidgetOptions).toConstantValue(options);
                child.bind(UserEditorWidget).toSelf();
                return child.get(UserEditorWidget);
            }
        }));

        bind(LabelProviderContribution).to(TestUsersLabelProviderContribution);
    }
}
