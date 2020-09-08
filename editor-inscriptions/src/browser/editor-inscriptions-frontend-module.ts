import { ContainerModule } from 'inversify';
import { UserEditorBinder } from './user/user-editor-frontend-module';

export default new ContainerModule(bind => {

    UserEditorBinder.bind(bind);

});
