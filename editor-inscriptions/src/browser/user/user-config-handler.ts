import { MonacoEditorModel } from "@theia/monaco/lib/browser/monaco-editor-model";

export class UserConfigHandler {

    static userModel = {
        "_declaration": {
            "_attributes": {
                "version": "1.0",
                "encoding": "UTF-8",
                "standalone": "yes"
            }
        },
        "userConfig": {
            "user": [] as any
        }
    }

    constructor(readonly model: MonacoEditorModel | undefined) {
    }

    readUsers() : User[] {
        let convert = require('xml-js');
        let result = convert.xml2json(this.model?.getText(), {compact: true, spaces: 4});
        let users : User[] = [];
        JSON.parse(result).userConfig?.user.forEach((user : any) => users.push(new User(user)));
        return users;
    }

    writeUsers(users : User[]) {
        let convert = require('xml-js');
        var userConfig = UserConfigHandler.userModel;
        userConfig.userConfig.user = [];
        users.forEach(user => userConfig.userConfig.user.push(user.toModel()));
        
        let result = convert.json2xml(userConfig, {compact: true, ignoreComment: true, spaces: 4});
        this.model?.applySnapshot({value: result});
        this.model?.save();
    }
}

export class User {
    private _userName: string;
    private _fullName: string;
    private _password: string;
    private _email: string;

    constructor(json : any) {
        this.userName = json.username?._text ?? "";
        this.fullName = json.fullName?._text ?? "";
        this.password = json.password?._text ?? "";
        this.email = json.emailAddress?._text ?? "";
    }

    get userName(): string {
        return this._userName;
    }
    
    set userName(newName: string) {
        this._userName = newName;
    }

    get fullName(): string {
      return this._fullName;
    }
  
    set fullName(newName: string) {
      this._fullName = newName;
    }

    get password(): string {
        return this._password;
    }

    set password(newPassword: string) {
        this._password = newPassword;
    }
    
    get email(): string {
        return this._email;
    }

    set email(newEmail: string) {
        this._email = newEmail;
    }

    toModel(): any {
        var model = {} as any;
        if (this.userName !== "") model.username = {"_text": this.userName};
        if (this.password !== "") model.password = {"_text": this.password};
        if (this.fullName !== "") model.fullName = {"_text": this.fullName};
        if (this.email !== "") model.emailAddress = {"_text": this.email};
        return model;
    }
  }