import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BaseStixComponent } from '../../../base-stix.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, IntrusionSet, Relationship, ExternalReference, Malware, Tool } from '../../../../models';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
    selector: 'intrusion-set',
    templateUrl: './intrusion-set.component.html'
})
export class IntrusionSetComponent extends BaseStixComponent implements OnInit {
    public intrusionSet: IntrusionSet = new IntrusionSet();
    public aliases: any = [];
    public addedTechniques: any = [];
    public currTechniques: any = [];
    public techniques: any = [];
    public addedSoftwares: any = [];
    public currSoftwares: any = [];
    public softwares: any = [];
    public editComponent: boolean = false;
    public origRels: any = [];
    public diff: any;
    public history: boolean = false;
    public historyArr: string[] = [];
    public relHistoryArr: any = [];
    public historyFound: boolean = false;

     constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.INTRUSION_SET_URL;
    }

    public ngOnInit() {
        this.loadIntrusionSet();
    }

    public editButtonClicked(): void {
        const link = ['../edit', this.intrusionSet.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.intrusionSet).subscribe(
            () => {
                let goBack = true;
                this.deleteRels(this.intrusionSet.id, goBack);
            }
        );
    }

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               const subscription = super.save(this.intrusionSet).subscribe(
                    (data) => {
                        observer.next(data);
                        observer.complete();
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
        });
    }

    public historyButtonClicked(): void {
        if (!this.historyFound) {
            let uri = this.stixService.url + '/' + this.intrusionSet.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as Tool;
                    this.diff = JSON.stringify(data.attributes.previous_versions);
                    super.getHistory(pattern, this.historyArr);
                    super.getRelHistory(pattern, this.relHistoryArr, this.origRels);
                    this.history = !this.history;
                    this.historyFound = true;
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
        } else {
            this.history = !this.history;
        }
    }

    public getAllAliases(): void {
        this.intrusionSet.attributes.aliases.shift();
        for (let alias of this.intrusionSet.attributes.aliases) {
            let description = '';
            let extRef = this.intrusionSet.attributes.external_references.filter(((h) => h.source_name === alias));
            if (extRef.length > 0) {
                this.intrusionSet.attributes.external_references = this.intrusionSet.attributes.external_references.filter(((h) => h.source_name !== alias));
                description = extRef[0].description;
            }
            this.aliases.push({'name': alias, 'description': description});
            this.intrusionSet.attributes.aliases = [];
        }
    }

    public findRelationships(technique: boolean): void {
        let filter = { 'stix.source_ref': this.intrusionSet.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter) + '&previousversions=true&metaproperties=true';
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let target = data as Relationship[];
                let i = 0;
                target.forEach((relationship: Relationship) => {
                    if (relationship.attributes.relationship_type === 'uses') {
                        if (technique) {
                            let tech = this.techniques.filter((h) => h.id === relationship.attributes.target_ref);
                            if (tech.length > 0) {
                                this.addedTechniques.push({'name': tech[0].name, 'description': relationship.attributes.description, 'relationship': relationship.id});
                                this.origRels.push(relationship);
                                this.currTechniques[i] = this.techniques;
                                for (let index in this.currTechniques) {
                                    for (let j in this.addedTechniques) {
                                       if (j !== index) {
                                           this.currTechniques[index] = this.currTechniques[index].filter((h) => h.name !== this.addedTechniques[j].name)
                                       }
                                    }
                                }
                                i += 1;
                            }
                        } else {
                            let sw = this.softwares.filter((h) => h.id === relationship.attributes.target_ref);
                            if (sw.length > 0) {
                                this.origRels.push(relationship);
                                this.addedSoftwares.push({'name': sw[0].name, 'description': relationship.attributes.description, 'relationship': relationship.id})
                                this.currSoftwares[i] = this.softwares;
                                for (let index in this.currSoftwares) {
                                    for (let j in this.addedSoftwares) {
                                       if (j !== index) {
                                           this.currSoftwares[index] = this.currSoftwares[index].filter((h) => h.name !== this.addedSoftwares[j].name)
                                       }
                                    }
                                }
                                i += 1;
                            }
                        }
                    }
                });
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

    public getTechniques(create: boolean): void {
        let subscription =  super.getByUrl(Constance.ATTACK_PATTERN_URL).subscribe(
            (data) => {
                let target = data as AttackPattern[];
                target.forEach((attackPattern: AttackPattern) => {
                    this.techniques.push({'name': attackPattern.attributes.name, 'id': attackPattern.id});
                });
                this.techniques = this.techniques.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
                if (!create) {
                    this.findRelationships(true);
                }
                console.log(this.techniques);
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

    public getSoftware(create: boolean): void {
        let subscription =  super.getByUrl(Constance.MALWARE_URL).subscribe(
            (data) => {
                let target = data as Malware[];
                target.forEach((malware: Malware) => {
                    this.softwares.push({'name': malware.attributes.name, 'id': malware.id});
                });
                this.getTools(create);
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

    public getTools(create: boolean): void {
        let subscription =  super.getByUrl(Constance.TOOL_URL).subscribe(
            (data) => {
                let target = data as Tool[];
                target.forEach((tool: Tool) => {
                    this.softwares.push({'name': tool.attributes.name, 'id': tool.id});
                });
                this.softwares = this.softwares.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
                if (!create) {
                    this.findRelationships(false);
                }
                console.log(this.softwares);
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

    public loadIntrusionSet(): void {
        const subscription =  super.get().subscribe(
            (data) => {
                this.intrusionSet = new IntrusionSet(data);
                this.getTechniques(false);
                this.getSoftware(false);
                if (this.editComponent) {
                    this.getAllAliases();
                }
                super.getCitations();
                this.intrusionSet.attributes.external_references.reverse();
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

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }
}
