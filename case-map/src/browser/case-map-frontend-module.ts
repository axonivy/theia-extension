import { ContainerModule } from 'inversify';
import { CaseMapWidget } from './case-map-widget';
import { CaseMapContribution } from './case-map-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, CaseMapContribution);
    bind(FrontendApplicationContribution).toService(CaseMapContribution);
    bind(CaseMapWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: CaseMapWidget.ID,
        createWidget: () => ctx.container.get<CaseMapWidget>(CaseMapWidget)
    })).inSingletonScope();
});
