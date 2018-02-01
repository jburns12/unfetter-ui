import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Constance } from '../../../utils/constance';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';

@Component({
  selector: 'history',
  templateUrl: './history-home.component.html',
  providers: [ StixService ]
})

export class HistoryHomeComponent extends BaseStixComponent implements OnInit {

    public getHistoryFromTo: boolean = false;
    public showAllHistory: boolean = false;
    public historyFound: boolean = false;
    public historyArr: any[] = [];
    public relHistoryArr: any = [];
    public startDate: any;
    public endDate: any;
    public allObjects: any = [];
    public allRels: any = [];
    public relationships: any = [];
    public urls: any = [Constance.ATTACK_PATTERN_URL, Constance.COURSE_OF_ACTION_URL, Constance.INTRUSION_SET_URL, Constance.MALWARE_URL, Constance.TOOL_URL];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.stixService.url = Constance.MULTIPLES_URL;
    }

    public ngOnInit() {
        this.getAllObjects();
        this.endDate = new Date();
    }

    public getAllObjects(): void {
        for (let currUrl of this.urls) {
            let uri = currUrl + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    this.allObjects = this.allObjects.concat(data);
                   }, (error) => {
                    // handle errors here
                     console.log('error ' + error);
                }, () => {
                    // prevent memory links
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            );
        }
        let uri = Constance.RELATIONSHIPS_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.relationships = this.relationships.concat(data);
               }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public searchHistory(): void {
        console.log(this.allObjects);
        console.log(this.startDate);
        console.log(this.endDate);
    }

    public cancelButtonClicked(): void {
        this.getHistoryFromTo = false;
        this.endDate = new Date();
        this.startDate = undefined;
    }
    public getFromTo(): void {
        this.getHistoryFromTo = true;
    }

    public hideShowAllButtonClicked(): void {
        this.showAllHistory = false;
    }

    public showAll(): void {
        if(!this.historyFound) {
            for (let pattern of this.allObjects) {
                let currHistory = [];
                let relHistory = [];
                super.getHistory(pattern, currHistory);
                super.getRelHistory(pattern, this.relHistoryArr, this.allRels);
                this.historyArr = this.historyArr.concat(Array.from(new Set(currHistory)));
                //this.relHistoryArr = this.relHistoryArr.concat(Array.from(new Set(relHistory)));
            }
            let allRelHistory = [];
            super.getAllHistory(this.relationships, this.allObjects, allRelHistory);

            this.historyArr = this.historyArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
            this.relHistoryArr = this.relHistoryArr.concat(Array.from(new Set(allRelHistory)));
            this.relHistoryArr = this.relHistoryArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
            this.historyFound = true;
            
        }
        this.showAllHistory = true;
    }
} 