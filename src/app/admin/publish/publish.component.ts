import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';

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
        this.message = "Generating ATT&CK content...this may take a few minutes. Please do not refresh page.";
        let publishAttack$ = this.adminService
            .publishAttack()
            .subscribe(
            (res) => {
                console.log(res);
                this.message = res.attributes;
            },
            (err) => {
                console.log(err);
                this.message = 'Token has timed out. Please sign out of and into the Editor to validate your GitHub credentials before publishing.';
            },
            () => {
                publishAttack$.unsubscribe();
            }
            );
    }

    public pushButton() {
        this.message = "Pushing ATT&CK content...this may take a few minutes. Please do not refresh page.";
        let pushAttack$ = this.adminService
            .pushAttack()
            .subscribe(
            (res) => {
                console.log(res);
                this.message = res.attributes;
            },
            (err) => {
                console.log(err);
                this.message = 'Please sign into the Editor to validate your GitHub credentials before publishing.';
            },
            () => {
                pushAttack$.unsubscribe();
            }
            );
    }

    public pushDevButton() {
        this.message = "Building the ATT&CK dev website...this may take a few minutes. Please do not refresh page.";
        let pushAttack$ = this.adminService
            .pushDevAttack()
            .subscribe(
            (res) => {
                console.log(res);
                this.message = res.attributes;
            },
            (err) => {
                console.log(err);
                this.message = 'Unable to build dev website.';
            },
            () => {
                pushAttack$.unsubscribe();
            }
            );
    }
}
