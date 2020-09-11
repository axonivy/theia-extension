import { injectable, inject, postConstruct } from "inversify";
import { ReactWidget, ConfirmDialog, SingleTextInputDialog, DialogError } from "@theia/core/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { MessageService, MaybePromise } from "@theia/core";
import React = require("react");
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { UserConfigHandler, User } from "./user-config-handler";
import { MonacoTextModelService } from "@theia/monaco/lib/browser/monaco-text-model-service";
import { MonacoEditorModel } from "@theia/monaco/lib/browser/monaco-editor-model";
import { Reference } from "@theia/core";

import 'primeflex/primeflex.min.css';
import 'primereact/resources/themes/md-dark-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

export const UserEditorWidgetOptions = Symbol('JsonschemaFormWidgetOptions');
export interface UserEditorWidgetOptions {
    uri: string
}

@injectable()
export class UserEditorWidget extends ReactWidget {
    
    static readonly ID = 'user-editor-widget';
    static readonly TITLE = 'User Editor';
    static readonly ICON = 'fa fa-user';
    static readonly CAN_HANDLE = '.userconfig';

    state = {
        users: {} as User[],
        selectedUser: null as any,
    };
    
    @inject(UserEditorWidgetOptions)
    protected readonly options: UserEditorWidgetOptions;
    
    @inject(MessageService)
    protected readonly messageService!: MessageService;
    
    @inject(MonacoTextModelService)
    protected readonly modelService: MonacoTextModelService;
    protected reference: Reference<MonacoEditorModel> | undefined;
    
    @postConstruct()
    protected async init(): Promise<void> {
        const { uri } = this.options;
        this.id = UserEditorWidget.ID + ':' + uri
        this.title.label = UserEditorWidget.TITLE + ' ' + new URI(uri).displayName;
        this.title.closable = true;
        this.title.iconClass = UserEditorWidget.ICON;
        
        const reference = await this.modelService.createModelReference(new URI(uri));
        if (this.toDispose.disposed) {
            reference.dispose();
            return;
        }
        this.toDispose.push(this.reference = reference);

        this.onRowSelect = this.onRowSelect.bind(this);

        this.loadUser();
        this.update();
    }

    onRowSelect(event: {originalEvent: Event, data: any}) {
        this.state.selectedUser = event.data;
        this.messageService.info('User selected: ' + event.data.userName);
        this.update();
    }

    updateUserName(event: React.FormEvent)
    {
        const target = event.target as HTMLInputElement;
        this.state.selectedUser.userName = target.value;
        this.setUsers();
    }

    updateFullName(event: React.FormEvent)
    {
        const target = event.target as HTMLInputElement;
        this.state.selectedUser.fullName = target.value;
        this.setUsers();
    }

    updatePassword(event: React.FormEvent)
    {
        const target = event.target as HTMLInputElement;
        this.state.selectedUser.password = target.value;
        this.setUsers();
    }

    updateEmail(event: React.FormEvent)
    {
        const target = event.target as HTMLInputElement;
        this.state.selectedUser.email = target.value;
        this.setUsers();
    }
    
    protected render(): React.ReactNode {
        return <div id='widget-container'>
            <div className="p-grid">
                <div className="p-col-12 p-md-6">
                    <DataTable value={this.state.users} selection={this.state.selectedUser} 
                        onRowClick={e => this.onRowSelect(e)} selectionMode="single" className="p-datatable-sm">
                        <Column field="userName" header="Username"></Column>
                        <Column field="fullName" header="Full Name"></Column>
                    </DataTable>
                    <button className='theia-button secondary' title='New User' onClick={_a => this.addNewUser()}>New</button>
                    <button className='theia-button secondary' title='Delete User' onClick={_a => this.removeUser()}>Delete</button>
                </div>
                <div className="p-col-12 p-md-6">
                    <div className="p-fluid">
                        <div className="p-field p-grid">
                            <label htmlFor="firstname4" className="p-col-12 p-md-4">Username</label>
                            <div className="p-col-12 p-md-8">
                                <InputText  id="firstname4" type="text" className="p-inputtext-sm"
                                    value={this.state.selectedUser?.userName} 
                                    onChange={e => this.updateUserName(e)} />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <label htmlFor="firstname4" className="p-col-12 p-md-4">Password</label>
                            <div className="p-col-12 p-md-8">
                                <InputText id="firstname4" type="password" className="p-inputtext-sm"
                                    value={this.state.selectedUser?.password} 
                                    onChange={e => this.updatePassword(e)} />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <label htmlFor="lastname4" className="p-col-12 p-md-4">Full Name</label>
                            <div className="p-col-12 p-md-8">
                                <InputText id="lastname4" type="text" className="p-inputtext-sm"
                                    value={this.state.selectedUser?.fullName}
                                    onChange={e => this.updateFullName(e)} />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <label htmlFor="firstname4" className="p-col-12 p-md-4">Email address</label>
                            <div className="p-col-12 p-md-8">
                                <InputText id="firstname4" type="email" className="p-inputtext-sm"
                                    value={this.state.selectedUser?.email} 
                                    onChange={e => this.updateEmail(e)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    loadUser() {
        let handler = new UserConfigHandler(this.reference?.object);
        this.state.users = handler.readUsers();
        console.log(JSON.stringify(this.state));
    }

    setUsers() {
        let handler = new UserConfigHandler(this.reference?.object);
        handler.writeUsers(this.state.users);
        this.update();
    }

    protected async addNewUser(): Promise<void> {
        let input = new SingleTextInputDialog({
            title: 'Create a new user',
            confirmButtonLabel: 'Add',
            validate: i => this.validateInput(i),
            initialValue: ''
        });
        const newValue = await input.open();
        this.state.users.push(new User({"username": {"_text": newValue}}));
        this.setUsers();
    }

    protected async removeUser() {
        let selectedUser = this.state.selectedUser;
        if (selectedUser === undefined)
        {
            this.messageService.info('Select a user for removal');
            return;
        }
        let confirm = new ConfirmDialog({
            title: 'Remove user',
            msg: 'Do you really want to remove the user ' + selectedUser.userName
        });
        const remove = await confirm.open();
        if (remove)
        {
            this.state.users.forEach( (user: User, index: number) => {
                if(user === selectedUser) {
                    this.state.users.splice(index,1);
                    this.messageService.info('User ' + selectedUser.userName + ' was removed successful');
                }
                this.setUsers();
            });
        }
    }

    validateInput(input: String): MaybePromise<DialogError> {
        if (input.length === 0)
        {
            return "Add a new user to the configuration";
        }
        return true;
    }

}
