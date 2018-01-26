import { Component, OnInit, ViewEncapsulation, ViewChildren, QueryList, ChangeDetectorRef  } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternComponent } from '../attack-pattern/attack-pattern.component';
import { AttackPattern, KillChainPhase, CourseOfAction, Relationship } from '../../../../models';
import { StixService } from '../../../stix.service';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-list',
    templateUrl: './attack-pattern-list.component.html',

})
export class AttackPatternListComponent extends AttackPatternComponent implements OnInit {

    public attackPatterns: AttackPattern[] = [];
    public selectedPhaseNameGroup: string;
    public phaseNameGroups = {};
    public phaseNameGroupKeys: string[];
    public filterAttackPattern = {};
    public attackPatternByPhaseMap: any = {};
    public numOfRows = 10;
    public displayedColumns: string[] = ['name', 'action'];
    public target: any;
    public foundCoA: CourseOfAction;
    public draftsOnly: boolean = false;
    public tempModel: any;
    public tempPhaseMap: any = {};

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar,
        private ref: ChangeDetectorRef) {

        super(stixService, route, router, dialog, location, snackBar);
        // this.phaseNameGroups['unspecified'] = [];
    }

    public ngOnInit() {
        const sortObj = { 'stix.name': '1' };
        const projectObj = {
            'stix.name': 1,
            'stix.external_references': 1,
            'stix.kill_chain_phases': 1,
            'stix.id': 1
        };
        const filter = `sort=${JSON.stringify(sortObj)}&project=${JSON.stringify(projectObj)}`;
        const subscription = super.load(filter).subscribe(
            (data) => {
                this.attackPatterns = data as AttackPattern[];
                let uri = Constance.CONFIG_URL;
                let subscription =  super.getByUrl(uri).subscribe(
                (res) => {
                    if (res && res.length) {
                        for (let currRes of res) {
                            if (currRes.attributes.configKey === 'tactics') {
                                for  (let currTactic of currRes.attributes.configValue) {
                                    if (currTactic.phase === 'act') {
                                        this.phaseNameGroups[currTactic.tactic] = [];
                                    }
                                }
                            }
                        }
                    }
                    this.populateAttackPatternByPhaseMap();
                    this.phaseNameGroupKeys = Object.keys(this.phaseNameGroups);
                }, (error) => {
                // handle errors here
                console.log('error ' + error);
                }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
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

    public draftsOnlyToggle() {
        this.draftsOnly = !this.draftsOnly;
        if (this.draftsOnly) {
            this.tempModel = this.attackPatterns;
            this.attackPatterns= this.attackPatterns.filter((h) => h.attributes["hasId"] === false);
            for (let key in this.attackPatternByPhaseMap) {
                this.tempPhaseMap[key] = this.attackPatternByPhaseMap[key];
                this.attackPatternByPhaseMap[key] = this.attackPatternByPhaseMap[key].filter((h) => h.attributes["hasId"] === false);
            }
        }
        else {
            this.attackPatterns = this.tempModel;
            for (let key in this.attackPatternByPhaseMap) {
                this.attackPatternByPhaseMap[key] = this.tempPhaseMap[key];
            }
        }

    }

    public populateAttackPatternByPhaseMap() {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let killChainPhases = attackPattern.attributes.kill_chain_phases;
            if (!killChainPhases || killChainPhases.length === 0) {
                if (this.attackPatternByPhaseMap.unspecified === undefined) {
                    this.attackPatternByPhaseMap.unspecified = [];
                }
                this.attackPatternByPhaseMap.unspecified.push(attackPattern);
            } else {
                killChainPhases.forEach((killChainPhase: KillChainPhase) => {
                    if (this.attackPatternByPhaseMap[killChainPhase.phase_name] === undefined) {
                        this.attackPatternByPhaseMap[killChainPhase.phase_name] = [];
                    }
                    if (this.hasAttackId(attackPattern)) {
                        attackPattern.attributes["hasId"] = true;
                    }
                    else {
                        attackPattern.attributes["hasId"] = false;
                    }
                    console.log(attackPattern.attributes["hasId"]);
                    this.attackPatternByPhaseMap[killChainPhase.phase_name].push(attackPattern);
                });
            }
        });
    }

    public hasAttackId(attackPattern: any) {
        let hasId = false;
        if (attackPattern.attributes.external_references !== undefined) {
            for (let extRef of attackPattern.attributes.external_references) {
                if (extRef.external_id !== undefined) {
                    hasId = true;
                }
            }
        }
        return hasId;
    }

    public onSelect(event: any, phaseNameGroup: any): void {
        event.preventDefault();
        this.selectedPhaseNameGroup = phaseNameGroup;

    }

    public edit(attackPattern: AttackPattern): void {
        let link = ['edit', attackPattern.id];
        super.gotoView(link);
    }

    public showDetails(event: any, attackPattern: AttackPattern): void {
        event.preventDefault();
        let link = ['.', attackPattern.id];
        super.gotoView(link);
    }

    public deletButtonClicked(attackPattern: AttackPattern, key: string): void {
        let coaRelationships = [];
        let filter = { 'stix.target_ref': attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                console.log(data);
                this.stixService.url = Constance.ATTACK_PATTERN_URL;
                this.target = data as Relationship[];
                coaRelationships = this.target.filter((h) => h.attributes.relationship_type === 'mitigates');

                super.openDialog(attackPattern).subscribe(
                    () => {
                        this.attackPatterns = this.attackPatterns.filter((h) => h.id !== attackPattern.id);
                        this.phaseNameGroups[key] = this.phaseNameGroups[key].filter((h) => h.id !== attackPattern.id);
                        this.attackPattern.id = attackPattern.id;
                        for (let rel of coaRelationships) {
                            let coaUri = Constance.COURSE_OF_ACTION_URL + '/' + rel.attributes.source_ref;
                            let subscript =  super.getByUrl(coaUri).subscribe(
                                (coaData) => {
                                    this.foundCoA = new CourseOfAction();
                                    this.foundCoA = coaData as CourseOfAction;
                                    this.foundCoA.url = Constance.COURSE_OF_ACTION_URL;
                                    this.delete(this.foundCoA, false).subscribe(
                                        () => {

                                        }
                                    );
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
                        }
                        this.deleteRels(this.attackPattern.id, false);
                        // TODO determine if there is a better wya to do this
                        let temp = this.attackPatternByPhaseMap[key].filter((h) => h.id !== attackPattern.id);
                        delete this.attackPatternByPhaseMap[key];
                        this.ref.detectChanges();
                        this.attackPatternByPhaseMap[key] = temp;

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

    public onTabShow(event: any): void {
        let phaseName = this.phaseNameGroupKeys[event.index];
        if (!this.filterAttackPattern[phaseName]) {
            this.loadData({ first: 0, rows: this.numOfRows }, this.phaseNameGroupKeys[event.index]);
        }
    }

    public totalRecords(key: string): number {
        return this.phaseNameGroups[key].length;
    }

    public loadData(event: any, phaseName: string): void {
        let attackPatterns = this.phaseNameGroups[phaseName] as AttackPattern[];
        attackPatterns = attackPatterns.filter((attackPattern: AttackPattern, index: number, arr: any) => {
            return (index >= event.first && index < (event.first + event.rows));
        });
        attackPatterns.sort(
            (a1: AttackPattern, a2: AttackPattern) => {
                return a1.attributes.name.toLowerCase().localeCompare(a2.attributes.name.toLowerCase());
            }
        );
        this.filterAttackPattern[phaseName] = attackPatterns;
    }
}
