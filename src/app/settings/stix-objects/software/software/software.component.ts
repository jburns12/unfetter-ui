import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { AttackPattern, KillChainPhase, Malware, Tool, IntrusionSet, Relationship } from '../../../../models';
import { StixService } from '../../../stix.service';
import { BaseStixComponent } from '../../../base-stix.component';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
  selector: 'software',
  templateUrl: './software.component.html',

})

export class SoftwareComponent extends BaseStixComponent implements OnInit {
   public malware: Malware = new Malware();
   public tool: Tool = new Tool();
   public aliases: any = [];
   public addedTechniques: any = [];
   public currTechniques: any = [];
   public techniques: any = [];
   public groups: any = [];
   public origRels: any = [];
   public allRels: any = [];
   public diff: any;
   public history: boolean = false;
   public historyArr: any[] = [];
   public relHistoryArr: any = [];
   public historyFound: boolean = false;
   public aliasesToDisplay: any = [];
   public attackId: string;

   constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.MALWARE_URL;
    }

    public ngOnInit() {
      this.loadMalware();
    }

    public trackByFunction(index: number, obj: any): any {
      return index;
    }

    public editButtonClicked(): void {
        let link = ['../edit', this.malware.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.malware).subscribe(
            () => {
                let goBack = true;
                super.deleteRels(this.malware.id, goBack);
            }
        );
    }

    public historyButtonClicked(): void {
        if (!this.historyFound) {
            let uri = this.stixService.url + '/' + this.malware.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as Malware;
                    let currHistory = [];
                    console.log(pattern);
                    this.diff = JSON.stringify(data.attributes.previous_versions);
                    super.getHistory(pattern, currHistory);
                    super.getRelHistory(pattern, this.relHistoryArr, this.allRels);
                    this.historyArr = Array.from(new Set(currHistory));
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

    public getGroups(): void {
        let subscription =  super.getByUrl(Constance.INTRUSION_SET_URL).subscribe(
            (data) => {
                let target = data as IntrusionSet[];
                target.forEach((intrusionSet: IntrusionSet) => {
                    this.groups.push({'name': intrusionSet.attributes.name, 'id': intrusionSet.id, 'extRefs': intrusionSet.attributes.external_references});
                });
                this.getTechniques(false);
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

    public findRelationships(): void {
        let filter = { 'stix.source_ref': this.malware.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter) + '&previousversions=true&metaproperties=true';
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let target = data as Relationship[];
                let i = 0;
                target.forEach((relationship: Relationship) => {
                    if (relationship.attributes.relationship_type === 'uses') {
                        let tech = this.techniques.filter((h) => h.id === relationship.attributes.target_ref);
                        if (tech.length > 0) {
                            this.addedTechniques.push({'name': tech[0].name, 'description': relationship.attributes.description, 'relationship': relationship.id});
                            this.origRels.push(relationship);
                            let relCopy = Object.assign({}, relationship);
                            relCopy.attributes.name = tech[0].name;
                            if (tech[0].extRefs !== undefined) {
                                for (let i in tech[0].extRefs) {
                                    if (tech[0].extRefs[i].external_id !== undefined) {
                                        relCopy.attributes.name = tech[0].extRefs[i].external_id;
                                    }
                                }
                            }
                            this.allRels.push(relCopy);
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
        let groupsFilter = { 'stix.target_ref': this.malware.id };
        let groupsUri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(groupsFilter) + '&previousversions=true&metaproperties=true';
        let groupsSubscription =  super.getByUrl(groupsUri).subscribe(
            (data) => {
                let target = data as Relationship[];
                target.forEach((relationship: Relationship) => {
                    let group = this.groups.filter((h) => h.id === relationship.attributes.source_ref);
                    if (group.length > 0) {
                        relationship.attributes.name = group[0].name;
                        if (group[0].extRefs !== undefined) {
                            for (let i in group[0].extRefs) {
                                if (group[0].extRefs[i].external_id !== undefined) {
                                    relationship.attributes.name = group[0].extRefs[i].external_id;
                                }
                            }
                        }
                        this.allRels.push(relationship);
                    }
                  });
               }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (groupsSubscription) {
                    groupsSubscription.unsubscribe();
                }
            }
        );
    }

    public getTechniques(create: boolean): void {
        let subscription =  super.getByUrl(Constance.ATTACK_PATTERN_URL).subscribe(
            (data) => {
                let target = data as AttackPattern[];
                target.forEach((attackPattern: AttackPattern) => {
                    this.techniques.push({'name': attackPattern.attributes.name, 'id': attackPattern.id, 'extRefs': attackPattern.attributes.external_references});
                });
                this.techniques = this.techniques.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
                if (!create) {
                    this.findRelationships();
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

    public getAllAliases(): void {
        if ('x_mitre_aliases' in this.malware.attributes) {
            this.malware.attributes.x_mitre_aliases.shift();
            for (let alias of this.malware.attributes.x_mitre_aliases) {
                let description = '';
                let extRef = this.malware.attributes.external_references.filter(((h) => h.source_name === alias));
                if (extRef.length > 0) {
                    this.malware.attributes.external_references = this.malware.attributes.external_references.filter(((h) => h.source_name !== alias));
                    description = extRef[0].description;
                }
                this.aliases.push({'name': alias, 'description': description});
                this.malware.attributes.x_mitre_aliases = [];
            }
        }
    }

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               let subscription = super.save(this.malware).subscribe(
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

    public loadMalware(): void {
        let sub = super.get().subscribe(
          (data) => {
            this.malware =  new Malware(data);
            this.malware.attributes.external_references.reverse();
            if (this.malware.attributes.external_references !== undefined) {
                for (let ref of this.malware.attributes.external_references) {
                    if (ref.external_id !== undefined) {
                        this.attackId = ref.external_id;
                    }
                }
            }
            this.aliasesToDisplay = this.malware.attributes.x_mitre_aliases.filter((h) => h !== this.malware.attributes.name);
            this.getGroups();
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

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }

    public visitExtRef(url): void {
        window.open(url, '_blank');
    }
}
