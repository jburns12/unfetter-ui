import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';

@Component({
    selector: 'publish',
    templateUrl: 'publish.component.html',
    styleUrls: ['publish.component.scss']
})
export class PublishComponent implements OnInit {
    public message: string = '';

    constructor(private adminService: AdminService) { }

    public ngOnInit() {
    }

    public publishButton() {
        this.message = "Publishing ATT&CK content...this may take a few minutes.";
        let publishAttack$ = this.adminService
            .publishAttack()
            .subscribe(
            (res) => {
                console.log(res);
                this.message = res.attributes;
            },
            (err) => {
                console.log(err.toString());
                this.message = "Unable to publish content."
            },
            () => {
                publishAttack$.unsubscribe();
            }
            );
    }
}
