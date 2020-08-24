/**
 * Generated using theia-extension-generator
 */
import { LabelProviderContribution } from "@theia/core/lib/browser";
import { ContainerModule } from "inversify";
import { LabelExtensionLabelProviderContribution } from './tree-iar-label-contribution';
import '../../src/browser/style/label.css';

export default new ContainerModule(bind => {
    bind(LabelProviderContribution).to(LabelExtensionLabelProviderContribution);
});
