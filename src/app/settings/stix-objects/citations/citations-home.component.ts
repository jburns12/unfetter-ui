import { Component, OnInit } from '@angular/core';
import { Constance } from '../../../utils/constance';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';

@Component({
  selector: 'citations',
  templateUrl: './citations-home.component.html'
})

export class CitationsHomeComponent extends BaseStixComponent implements OnInit {
    public citations: any = [];
    public addNewCitation: string = '';
    public addCitation: boolean = false;
    public addNewMessage: boolean = false;
    public newCitation: any = {};
    public rateControl: any;
    public yearControl: any;
    public months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    public foundReferences: any;
    public configData: any;

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.MULTIPLES_URL;
    }

    public ngOnInit() {
        this.loadCitations();
        this.rateControl = new FormControl("", [Validators.max(31), Validators.min(1)]);
        this.yearControl = new FormControl("", [Validators.max(2100), Validators.min(1970)])
    }

    public getRefDescription(): any {
        let description = '';

        description = description + this.newCitation.authors + '. ';

        if (this.newCitation.month !== undefined || this.newCitation.day !== undefined || this.newCitation.year !== undefined) {
            let dateStr = '(';
            if (this.newCitation.year !== undefined) {
                dateStr = dateStr + this.newCitation.year;
            }
            if (this.newCitation.month !== undefined) {
                dateStr = dateStr + ', ' + this.newCitation.month;
            }
            if (this.newCitation.day !== undefined) {
                dateStr = dateStr + ' ' + this.newCitation.day;
            }
            dateStr = dateStr += ')';
            description = description + dateStr + '. ';
        }
        else {
            description = description + '(n.d.). ';
        }

        if (this.newCitation.title !== undefined) {
            description = description + this.newCitation.title + '. ';
        }

        description = description + 'Retrieved ' + this.months[this.newCitation.retrieved.getMonth()] + ' ' + this.newCitation.retrieved.getDate() + ', ' + this.newCitation.retrieved.getFullYear() + '.';

        return description;
    }

    public addCreatedCitation(): void {
        console.log(this.newCitation);

        let refToAdd = {};

        refToAdd['source_name'] = this.newCitation.key;
        if (this.newCitation.url !== undefined) {
            refToAdd['url'] = this.newCitation.url;
        }
        refToAdd['description'] = this.getRefDescription();
        console.log(refToAdd);
        if (this.foundReferences !== undefined) {
            this.addReferenceToConfig(refToAdd);
        }
        else {
            this.createReferencesInConfig(refToAdd);
        }
    }

    public addReferenceToConfig(refToAdd): void {
        this.foundReferences.attributes.configValue.push(refToAdd);
        this.foundReferences.url = Constance.CONFIG_URL;
        this.foundReferences.id = this.foundReferences.attributes.id;
        this.stixService.url = Constance.CONFIG_URL;
        let subscription = super.save(this.foundReferences).subscribe(
             (data) => {
                 console.log(data);
                 this.stixService.url = Constance.MULTIPLES_URL;
                 this.addCitation = false;
                 this.loadCitations();
                 this.addNewMessage = 'Added reference ' + refToAdd.source_name;
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

    public createReferencesInConfig(refToAdd): void {
        let newConfig = {};
        newConfig['attributes'] = {};
        newConfig.attributes['configKey'] = 'references';
        newConfig.attributes['configValue'] = [];
        newConfig.attributes['configValue'].push(refToAdd);
        newConfig['url'] = Constance.CONFIG_URL;

        let sub = super.create(newConfig).subscribe(
           (data) => {
                console.log(data);
                this.addCitation = false;
                this.loadCitations();
                this.addNewMessage = 'Added reference ' + refToAdd.source_name;
           }, (error) => {
               // handle errors here
                console.log('error ' + error);
           }, () => {
               // prevent memory links
               if (sub) {
                   sub.unsubscribe();
               }
           }
       );
    }

    public loadCitations(): void {
        let subscription = super.load().subscribe(
            (data) => {
                let extRefs = [];
                for (let currObj of data) {
                    if (currObj.attributes.external_references && currObj.attributes.external_references.source_name !== 'mitre-attack') {
                        extRefs = extRefs.concat(currObj.attributes.external_references);
                    }
                }
                let uri = Constance.CONFIG_URL;
                let subscription =  super.getByUrl(uri).subscribe(
                    (data) => {
                        if (data) {
                            for (let i = 0; i < data.length; ++i) {
                                console.log(data[i]);
                                if (data[i].attributes.configKey === 'references') {
                                    this.foundReferences = data[i];
                                    extRefs = extRefs.concat(data[i].attributes.configValue);
                                    extRefs = extRefs.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                                    this.citations = extRefs.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
                                    console.log(this.citations);
                                }
                            }
                        }
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

    public createNewCitation(): void {
        this.addCitation = true;
        this.newCitation = {};
        this.addNewMessage = false;
    }
}
