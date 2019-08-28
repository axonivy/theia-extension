/**
 * Generated using theia-extension-generator
 */

import { TheiaExtensionCommandContribution, TheiaExtensionMenuContribution } from './theia-extension-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";

import { ContainerModule } from "inversify";

import '../../src/browser/style/index.css';
import './branding';

export default new ContainerModule(bind => {
    // add your contribution bindings here
    
    bind(CommandContribution).to(TheiaExtensionCommandContribution);
    bind(MenuContribution).to(TheiaExtensionMenuContribution);
    
});