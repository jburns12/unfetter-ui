import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../../base-stix.component';
import { AttackPattern, CourseOfAction, Relationship } from '../../../../models';
import { StixService } from '../../../stix.service';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
  selector: 'attack-pattern',
  templateUrl: './attack-pattern.component.html',

})

export class AttackPatternComponent extends BaseStixComponent implements OnInit {

    public attackPattern: AttackPattern = new AttackPattern();
    public mitigation: string = '';
    public courseOfAction: CourseOfAction = new CourseOfAction();
    public relationship: Relationship = new Relationship();
    public coaId: string = '';
    public coaMitreId: string;
    public target: any;
    public history: boolean = false;
    public historyArr: any[];
    public relHistoryArr: any = [];
    public historyFound: boolean = false;
    public diff: any;
    public allRels: any = [];
    public deleteMitigation: boolean = false;
    public attackId: string;
    public deprecated: boolean = false;
    public revoked: boolean = false;
    public mitigations: any = [];
    public origMitigations: any = [];
    public allMitigations: any;
    public allMitStatic: any = [];
    public lastMobileMit: any;
    public allCitations: any = [];
    public extRefsLen: any;

    //track data loading progress
    private sourceRelsLoaded: boolean = false;
    private attackPatternLoaded: boolean = false;
    private coALoaded: boolean = false;


    public x_unfetter_sophistication_levels = [
          { id : 1, value: '1 - Novice' },
          { id : 2, value: '2 - Practicioner' },
          { id : 3, value: '3 - Expert' },
          { id : 4, value: '4 - Innovator' }
    ];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.ATTACK_PATTERN_URL;
    }

    public ngOnInit() {
       this.loadAttackPattern();
    }

    public trackByFunction(index: number, obj: any): any {
      return index;
    }

    public editButtonClicked(): void {
        let link = [];
        if (this.attackPattern.attributes.x_mitre_collections[0] === '062767bd-02d2-4b72-84ba-56caef0f8658') {
            link = ['../edit-pre', this.attackPattern.id];
        }
        else if (this.attackPattern.attributes.x_mitre_collections[0] === '2f669986-b40b-4423-b720-4396ca6a462b') {
            link = ['../edit-mobile', this.attackPattern.id];
        }
        else {
            link = ['../edit', this.attackPattern.id];
        }
        super.gotoView(link);
    }

    public checkAddedMitigations(i: any): void {
        let foundMitigation = this.allMitStatic.find((p) => p.attributes.name === this.mitigations[i].name);
        if (foundMitigation !== undefined) {
            this.mitigations[i].description = foundMitigation.attributes.description;
            this.mitigations[i].id = foundMitigation.id;

        }
    }

    public historyButtonClicked(): void {
        if (!this.allDataLoaded()) { 
            console.warn("cannot show history until all data is loaded");
            return;
        }
        if (!this.historyFound) {
            let uri = this.stixService.url + '/' + this.attackPattern.id + '?previousversions=true&metaproperties=true';
            let subscription =  super.getByUrl(uri).subscribe(
                (data) => {
                    let pattern = data as AttackPattern;
                    let currHistory = [];
                    super.getHistory(pattern, currHistory);
                    super.getRelHistory(pattern, this.relHistoryArr, this.allRels);
                    this.historyArr = Array.from(new Set(currHistory));
                    this.historyArr = this.historyArr.concat(this.relHistoryArr);
                    this.historyArr = this.historyArr.sort((a, b) => new Date(a.date) < new Date(b.date) ? -1 : new Date(a.date) > new Date(b.date) ? 1 : 0);
                    for (let i in this.historyArr) {
                        this.historyArr[i].date = new Date(this.historyArr[i].date).toUTCString();
                    }
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

    public deleteButtonClicked(): void {
        super.openDialog(this.attackPattern).subscribe(
            () => {
                this.deleteMitigation = true;
                this.deleteCoAandRels();
            }
        );
    }

    public deleteCoAandRels(): void {
        let goBack = true;
        this.deleteRels(this.attackPattern.id, goBack);
        if (this.coaId !== '') {
            this.courseOfAction.url = Constance.COURSE_OF_ACTION_URL;
            this.delete(this.courseOfAction, false).subscribe(
                () => {

                }
            );
        }
    }
    public loadAttackPattern(domain: string = 'enterprise-attack'): void {
         let subscription =  super.get().subscribe(
            (data) => {
                let domain = '';
                this.attackPattern = data as AttackPattern;
                if (this.attackPattern.attributes.external_references !== undefined) {
                    for (let ref of this.attackPattern.attributes.external_references) {
                        if (ref.source_name == 'mitre-attack' || ref.source_name == 'mitre-pre-attack' || ref.source_name == 'mitre-mobile-attack') {
                            this.attackId = ref.external_id;
                            domain = ref.source_name;
                        }
                    }
                }
                if (this.attackPattern.attributes.x_mitre_deprecated !== undefined) {
                    this.deprecated = this.attackPattern.attributes.x_mitre_deprecated;
                }
                if (this.attackPattern.attributes.revoked !== undefined) {
                    this.revoked = this.attackPattern.attributes.revoked;
                }
                this.attackPattern.attributes.external_references.reverse();
                this.extRefsLen = this.attackPattern.attributes.external_references.length;
                this.attackPatternLoaded = true;
                this.findSourceRels();
                this.findCoA(domain);
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

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               let subscription = super.save(this.attackPattern).subscribe(
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

    public getSophisticationLevel(id: number): string {
        let sophisticationLevel = this.x_unfetter_sophistication_levels.find(
            (sophistication) => {
                return sophistication.id === id;
            }
        );
        return sophisticationLevel ? sophisticationLevel.value : '';
    }

    public foundPlatform(platform: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_platforms.find((p) => {
            return p === platform;
        });
        return found ? true : false;
    }

    public foundTacticType(tacticType: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_tactic_type.find((p) => {
            return p === tacticType;
        });
        return found ? true : false;
    }

    public foundPermission(permission: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_permissions_required.find((p) => {
            return p === permission;
        });
        return found ? true : false;
    }

    public foundEffectivePerm(permission: string): boolean {
        let found = this.attackPattern.attributes.x_mitre_effective_permissions.find((p) => {
            return p === permission;
        });
        return found ? true : false;
    }

    public permsReqExist(): boolean {
      let found = true;
      if (this.attackPattern.attributes.x_mitre_permissions_required) {
        if (!this.attackPattern.attributes.x_mitre_permissions_required.length) {
          found = false
        }
      } else {
        found = false;
      }
      return found ? true : false;
    }

    public getAllCoAs(): void {
        let coaUri = Constance.COURSE_OF_ACTION_URL;
        let coaSubscript = super.getByUrl(coaUri).subscribe(
            (coaData) => {
                this.allMitigations = coaData as CourseOfAction[];
                this.allMitigations.forEach((coa: CourseOfAction) => {
                    this.allMitStatic.push(coa);
                })
            }, (error) => {
                // handle errors here
                console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (coaSubscript) {
                    coaSubscript.unsubscribe();
                }
            }
        );
    }

    public getMitId(): void {
        let coaUri = Constance.COURSE_OF_ACTION_URL;
        let coaSubscript = super.getByUrl(coaUri).subscribe(
            (coaData) => {
                let ids = [];
                this.allMitigations = coaData as CourseOfAction[];
                this.allMitigations.forEach((coa: CourseOfAction) => {
                    if (coa.attributes.external_references[0] && coa.attributes.external_references[0].external_id && coa.attributes.external_references[0].source_name === "mitre-mobile-attack") {
                        ids.push(coa.attributes.external_references[0].external_id);
                    }
                })
                let allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                ).sort().filter(Boolean);
                this.lastMobileMit = 'M' + (parseInt(allIds[allIds.length - 1].substr(1)) + 1);
            }, (error) => {
                // handle errors here
                console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (coaSubscript) {
                    coaSubscript.unsubscribe();
                }
            }
        );
    }

    public findCoA(domain: string): void {
        let coaUri = Constance.COURSE_OF_ACTION_URL;
        let coaSubscript = super.getByUrl(coaUri).subscribe(
            (coaData) => {
                let mitigations = [];
                let ids = [];
                this.allMitigations = coaData as CourseOfAction[];
                this.allMitigations.forEach((coa: CourseOfAction) => {
                    this.allMitStatic.push(coa);
                    if (coa.attributes.external_references[0] && coa.attributes.external_references[0].external_id && coa.attributes.external_references[0].source_name === "mitre-mobile-attack") {
                        ids.push(coa.attributes.external_references[0].external_id);
                    }
                })
                let allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                ).sort().filter(Boolean);
                this.lastMobileMit = 'M' + (parseInt(allIds[allIds.length - 1].substr(1)) + 1);
                let filter = { 'stix.target_ref': this.attackPattern.id };
                let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter) + '&previousversions=true&metaproperties=true';
                let subscription =  super.getByUrl(uri).subscribe(
                    (data) => {
                        this.stixService.url = Constance.ATTACK_PATTERN_URL;
                        this.target = data as Relationship[];
                        let unresolved = this.target.length;
                        if (unresolved == 0) { this.coALoaded = true; }
                        this.target.forEach((relationship: Relationship) => {
                            if (relationship.attributes.relationship_type === 'mitigates') {
                                mitigations.push(relationship);
                            }

                            let relFilter = { 'stix.id': relationship.attributes.source_ref };
                            let multiplesUri = Constance.MULTIPLES_URL + '?filter=' + JSON.stringify(relFilter);
                            let subscript =  this.getByUrl(multiplesUri).subscribe(
                                (multiplesData) => {
                                    relationship.attributes.name = multiplesData[0].attributes.name;
                                    if (multiplesData[0].attributes.external_references !== undefined) {
                                        for (let i in multiplesData[0].attributes.external_references) {
                                            if (multiplesData[0].attributes.external_references[i].external_id !== undefined) {
                                                relationship.attributes.name = multiplesData[0].attributes.external_references[i].external_id;
                                            }
                                        }
                                    }
                                    this.allRels.push(relationship);
                                    if (--unresolved == 0) { this.coALoaded = true; }
                                }, (error) => {
                                    // handle errors here
                                    console.log('error ' + error);
                                    if (--unresolved == 0) { this.coALoaded = true; }
                                }, () => {
                                    // prevent memory links
                                    if (subscript) {
                                        subscript.unsubscribe();
                                    }
                                }
                            );
                        });
                        mitigations.forEach((mitigation: any) => {
                            let currMitigation = this.allMitigations.find((p) => (p.id === mitigation.attributes.source_ref));
                            if (currMitigation !== undefined) {
                                this.origMitigations.push({'id': currMitigation.id});
                                let description = currMitigation.attributes.description;
                                if (domain == 'mitre-mobile-attack'){
                                    if ('description' in mitigation.attributes) {
                                        description = mitigation.attributes.description;
                                    }
                                    else {
                                        description = '';
                                    }
                                }
                                this.mitigations.push({'id': currMitigation.id, 'name': currMitigation.attributes.name, 'description': description, 'rel_id': mitigation.id});
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
            }, (error) => {
                // handle errors here
                console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (coaSubscript) {
                    coaSubscript.unsubscribe();
                }
            }
        );
    }

    public findSourceRels(): void {
        let filter = { 'stix.source_ref': this.attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter) + '&previousversions=true&metaproperties=true';
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.target = data as Relationship;
                let unresolved = this.target.length;
                if (unresolved == 0) { this.sourceRelsLoaded = true; }
                this.target.forEach((relationship: Relationship) => {
                  let relFilter = { 'stix.id': relationship.attributes.target_ref };
                  let multiplesUri = Constance.MULTIPLES_URL + '?filter=' + JSON.stringify(relFilter);
                  let subscript =  this.getByUrl(multiplesUri).subscribe(
                      (multiplesData) => {
                            relationship.attributes.name = multiplesData[0].attributes.name;
                            this.allRels.push(relationship);
                            if (--unresolved == 0) { this.sourceRelsLoaded = true; }
                         }, (error) => {
                          // handle errors here
                           console.log('error ' + error);
                      }, () => {
                          // prevent memory links
                          if (subscript) {
                              subscript.unsubscribe();
                          }
                      }
                  );
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

    public saveRelationship(attackPatternId: string, coaId: string, description: string = ''): void {
        this.relationship.attributes.source_ref = coaId;
        this.relationship.attributes.target_ref = attackPatternId;
        this.relationship.attributes.relationship_type = 'mitigates';
        if (description !== ''){
            this.relationship.attributes.description = description;
        }
        this.relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        let subscription = super.create(this.relationship).subscribe(
            (data) => {
                console.log(data);
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

    public saveRevisedRelationship(attackPatternId: string, coaId: string, description: string = '', rel_id: string): void {
        let rel = new Relationship();
        rel.attributes.source_ref = coaId;
        rel.attributes.target_ref = attackPatternId;
        rel.id = rel_id;
        rel.attributes.external_references = [];
        if (description != ''){
            rel.attributes.description = description;
            let citationArr = super.matchCitations(rel.attributes.description);
            for (let name of citationArr) {
                let citation = this.allCitations.find((p) => p.source_name === name);
                if (citation !== undefined) {
                    if (rel.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                        rel.attributes.external_references.push(citation);
                    }
                }
            }
        }
        this.stixService.url = Constance.RELATIONSHIPS_URL;
    
        let subscription = super.save(rel).subscribe(
            (data) => {
                console.log(data);
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

    public visitExtRef(url): void {
        window.open(url, '_blank');
    }
    /**
     * Return whether all the data for this attack pattern is loaded
     * @returns {boolean} true if everything is loaded, false otherwise
     */
    public allDataLoaded(): boolean { 
        return this.coALoaded && this.attackPatternLoaded && this.sourceRelsLoaded;
    }
}
