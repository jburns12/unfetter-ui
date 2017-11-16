import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';

@Component({
    selector: 'config-edit',
    templateUrl: 'config-edit.component.html',
    styleUrls: ['config-edit.component.scss']
})
export class ConfigEditComponent implements OnInit {

    public configData: any[] = [];
    public message: string;
    public messageType: string;

    constructor(private adminService: AdminService) { }

    public ngOnInit() {
        this.fetchConfig();
    }

    public changeData(configData): void {
        var currDataConfig = Object.assign({}, configData);
        currDataConfig['configValue'] = configData['configValue'].split('\n');
        for (let i in currDataConfig['configValue']) {
            currDataConfig['configValue'][i] = currDataConfig['configValue'][i].replace(/\s*$/,"");
        }
        currDataConfig['configValue'] = currDataConfig['configValue'].filter((p) => p !== '');
        let processChangedData$ = this.adminService
            .processChangedData({ data: { attributes: currDataConfig } }, currDataConfig.id)
            .subscribe(
            (res) => {
                console.log(res);
                this.message = `${res.attributes.configKey} have been saved.`;
                this.messageType = res.attributes.configKey;
            },
            (err) => {
                console.log(err);
            },
            () => {
                processChangedData$.unsubscribe();
            }
            );
    }

    private fetchConfig() {
        let configData$ = this.adminService.getConfig()
            .subscribe(
            (res) => {
                console.log(res);
                if (res && res.length) {
                    for (let currRes of res) {
                        if (currRes.attributes.configKey === 'x_mitre_platforms' || currRes.attributes.configKey === 'x_mitre_data_sources' || currRes.attributes.configKey === 'tactics') {
                            let currData = {};
                            currData['id'] = currRes.attributes._id;
                            currData['configKey'] = currRes.attributes.configKey;
                            currData['configValue'] = currRes.attributes.configValue.toString().replace(/,/g, '\n');
                            this.configData.push(currData);
                        }
                    }
                } else {
                    this.configData = [];
                }
                console.log(this.configData);
            },
            (err) => {
                console.log(err);
            },
            () => {
                configData$.unsubscribe();
            }
            );
    }
}
