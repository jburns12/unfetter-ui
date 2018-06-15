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
    public phaseNameGroupKeysEnterprise: string[];
    public phaseNameGroupKeysPre: string[];
    public phaseNameGroupKeysMobile: string[];
    public filterAttackPattern = {};
    public attackPatternByPhaseMap: any = {'enterprise': {}, 'pre': {}, 'mobile': {}};
    public numOfRows = 10;
    public attack: any = {'enterprise': [], 'pre': [], 'mobile': []};
    public enterpriseLen = 0;
    public preLen = 0;
    public mobileLen = 0;
    public displayedColumns: string[] = ['name', 'action'];
    public target: any;
    public foundCoA: CourseOfAction;
    public draftsOnly: any = {'enterprise': false, 'pre': false, 'mobile': false};
    public tempModel: any = {'enterprise': [], 'pre': [], 'mobile': []};
    public tempPhaseMap: any = {};
    public domainToShow: string = 'Enterprise';
    public whichDomain = [
        {'name': 'Enterprise', 'val': true},
        {'name': 'PRE-ATT&CK', 'val': false},
        {'name': 'Mobile', 'val': false}
    ]

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
        const filter = `sort=${JSON.stringify(sortObj)}`;
        const subscription = super.load(filter).subscribe(
            (data) => {
                this.attackPatterns = data as AttackPattern[];
                console.log(this.attackPatterns);
                let uri = Constance.CONFIG_URL;
                let subscript =  super.getByUrl(uri).subscribe(
                (res) => {
                    if (res && res.length) {
                        for (let currRes of res) {
                            if (currRes.attributes.configKey === 'tactics') {
                                let phaseNameGroupsEnterprise = {};
                                let phaseNameGroupsPre = {};
                                let phaseNameGroupsMobile= {};
                                for (let currTactic of currRes.attributes.configValue.enterprise_tactics.tactics) {
                                    this.phaseNameGroups[currTactic.tactic] = [];
                                    phaseNameGroupsEnterprise[currTactic.tactic] = [];
                                }
                                this.phaseNameGroupKeysEnterprise = Object.keys(phaseNameGroupsEnterprise);
                                for (let currTactic of currRes.attributes.configValue.pre_attack_tactics.tactics) {
                                    this.phaseNameGroups[currTactic.tactic] = [];
                                    phaseNameGroupsPre[currTactic.tactic] = [];
                                }
                                this.phaseNameGroupKeysPre = Object.keys(phaseNameGroupsPre);
                                for (let currTactic of currRes.attributes.configValue.mobile_tactics.tactics) {
                                    this.phaseNameGroups[currTactic.tactic] = [];
                                    phaseNameGroupsMobile[currTactic.tactic] = [];
                                }
                                this.phaseNameGroupKeysMobile = Object.keys(phaseNameGroupsMobile);
                            }
                        }
                    }
                    this.populateAttackPatternByPhaseMap();
                }, (error) => {
                // handle errors here
                console.log('error ' + error);
                }, () => {
                // prevent memory links
                if (subscript) {
                    subscript.unsubscribe();
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

    public addRemoveWhichDomain(answer: string) {
        this.domainToShow = answer;
        for (let i in this.whichDomain) {
            if (this.whichDomain[i].name === answer) {
                this.whichDomain[i].val = true;
            }
            else {
                this.whichDomain[i].val = false;
            }
        }
    }
    
    public draftsOnlyToggle(domain: string) {
        this.draftsOnly[domain] = !this.draftsOnly[domain];
        if (this.draftsOnly[domain]) {
            this.tempModel[domain] = this.attack[domain];
            this.attack[domain] = this.attack[domain].filter((h) => h.attributes['hasId'] === false);
            for (let key in this.attackPatternByPhaseMap[domain]) {
                this.tempPhaseMap[key] = this.attackPatternByPhaseMap[domain][key];
                this.attackPatternByPhaseMap[domain][key] = this.attackPatternByPhaseMap[domain][key].filter((h) => h.attributes['hasId'] === false);
            }
        } else {
            this.attack[domain] = this.tempModel[domain];
            for (let key in this.attackPatternByPhaseMap[domain]) {
                this.attackPatternByPhaseMap[domain][key] = this.tempPhaseMap[key];
            }
        }

    }

    public populateAttackPatternByPhaseMap() {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let killChainPhases = attackPattern.attributes.kill_chain_phases;
            if (!killChainPhases || killChainPhases.length === 0) {
                if (this.attackPatternByPhaseMap.enterprise.unspecified === undefined) {
                    this.attackPatternByPhaseMap.enterprise.unspecified = [];
                }
                this.attackPatternByPhaseMap.enterprise.unspecified.push(attackPattern);
            } else {
                let found = false;
                killChainPhases.forEach((killChainPhase: KillChainPhase) => {
                    if (this.hasAttackId(attackPattern)) {
                        attackPattern.attributes['hasId'] = true;
                    } else {
                        attackPattern.attributes['hasId'] = false;
                    }
                    if (attackPattern.attributes.x_mitre_deprecated === undefined) {
                        attackPattern.attributes['x_mitre_deprecated'] = false;
                    }
                    if (attackPattern.attributes.revoked === undefined) {
                        attackPattern.attributes['revoked'] = false;
                    }
                    if (killChainPhase.kill_chain_name === 'mitre-attack') {
                        if (this.attackPatternByPhaseMap.enterprise[killChainPhase.phase_name] === undefined) {
                            this.attackPatternByPhaseMap.enterprise[killChainPhase.phase_name] = [];
                        }
                        if (!found) {
                            this.attack['enterprise'].push(attackPattern);
                        }
                        found = true;
                        this.attackPatternByPhaseMap.enterprise[killChainPhase.phase_name].push(attackPattern);
                    }
                    else if (killChainPhase.kill_chain_name === 'mitre-pre-attack') {
                        if (this.attackPatternByPhaseMap.pre[killChainPhase.phase_name] === undefined) {
                            this.attackPatternByPhaseMap.pre[killChainPhase.phase_name] = [];
                        }
                        if (!found) {
                            this.attack['pre'].push(attackPattern);
                        }
                        found = true;
                        this.attackPatternByPhaseMap.pre[killChainPhase.phase_name].push(attackPattern);
                    }
                    else {
                        if (this.attackPatternByPhaseMap.mobile[killChainPhase.phase_name] === undefined) {
                            this.attackPatternByPhaseMap.mobile[killChainPhase.phase_name] = [];
                        }
                        if (!found) {
                            this.attack['mobile'].push(attackPattern);
                        }
                        found = true;
                        this.attackPatternByPhaseMap.mobile[killChainPhase.phase_name].push(attackPattern);
                    }
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

    public deletButtonClicked(attackPattern: AttackPattern, key: string, domain: string): void {
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
                        if (domain === 'enterprise') {
                            let temp = this.attackPatternByPhaseMap.enterprise[key].filter((h) => h.id !== attackPattern.id);
                            delete this.attackPatternByPhaseMap.enterprise[key];
                            this.ref.detectChanges();
                            this.attackPatternByPhaseMap.enterprise[key] = temp;
                            this.enterpriseLen -= 1;
                        }

                        else if (domain === 'pre') {
                            let preTemp = this.attackPatternByPhaseMap.pre[key].filter((h) => h.id !== attackPattern.id);
                            delete this.attackPatternByPhaseMap.pre[key];
                            this.ref.detectChanges();
                            this.attackPatternByPhaseMap.pre[key] = preTemp;
                            this.preLen -= 1;
                        }

                        else {
                            let mobileTemp = this.attackPatternByPhaseMap.mobile[key].filter((h) => h.id !== attackPattern.id);
                            delete this.attackPatternByPhaseMap.mobile[key];
                            this.ref.detectChanges();
                            this.attackPatternByPhaseMap.mobile[key] = mobileTemp;
                            this.mobileLen -= 1;
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
