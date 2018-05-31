import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { AttackPatternComponent } from '../attack-pattern/attack-pattern.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction, ExternalReference, KillChainPhase, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-edit',
    templateUrl: './attack-pattern-edit.component.html'
})

export class AttackPatternEditComponent extends AttackPatternComponent implements OnInit {
    public platforms: any = [];
    public contributors: string[] = [];
    public dataSources: string[] = [];
    public id: string;
    public idLink: string = "{{LinkById|";
    public allCitations: any = [];
    public attackPatterns: AttackPattern[];
    public tacticConfig: string[] = [];
    public tacticBools: any = {'privEsc': false, 'execution': false, 'defEvas': false, 'exFil': false};
    public tactics: any = [];
    public createNewOnly: boolean = true;
    public mitreId: any;
    public addId: boolean = false;
    public deprecated: boolean = false;
    public revoked: boolean = false;
    public revokedBy: any = '';
    public foundRevoked: string = '';
    public origTarget: string = '';
    public newMitigations: any = [];
    public supportsRemoteReqNet: any = [
        {'label': 'Yes        ', 'value': true},
        {'label': 'No', 'value': false}
    ];
    public easyForAdversary = [
        {'name': 'Yes', 'val': true},
        {'name': 'No', 'val': false}
    ]

    public detectable = [
        {'name': 'Yes', 'val': true},
        {'name': 'Partial', 'val': false},
        {'name': 'No', 'val': false}
    ]

    public permissions_req = [
      {'name': 'Administrator', 'val': false},
      {'name': 'root', 'val': false},
      {'name': 'SYSTEM', 'val': false},
      {'name': 'User', 'val': false},
      {'name': 'Remote Desktop Users', 'val': false}
    ];

    public effective_perms = [
      {'name': 'Administrator', 'val': false},
      {'name': 'root', 'val': false},
      {'name': 'SYSTEM', 'val': false},
      {'name': 'User', 'val': false}
    ];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
       super.loadAttackPattern();
       let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
       let subscription = super.load(filter).subscribe(
           (data) => {
               this.attackPatterns = data as AttackPattern[];
               this.getConfigs();
               this.getContributors();
               this.assignPerms();
               this.findCoA();
               this.findRevokedBy();
               this.getCitations();
               this.assignCitations();
               this.getMitreId();
               this.getId();
               this.getDeprecated();
               this.getRevoked();
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

    public getDeprecated(): void {
        if (this.attackPattern.attributes.x_mitre_deprecated) {
            this.deprecated = this.attackPattern.attributes.x_mitre_deprecated;
        }
    }

    public getRevoked(): void {
        if (this.attackPattern.attributes.revoked) {
            this.revoked = this.attackPattern.attributes.revoked;
        }
    }

    public filterOptions(stringToMatch: string, listToParse: any): void {
        if (stringToMatch) {
            let filterVal = stringToMatch.toLowerCase();
            return listToParse.filter((h) => h.toLowerCase().startsWith(filterVal));
        }
        return listToParse;
    }

    public getCitations(): void {
        let uri = Constance.MULTIPLES_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let extRefs = [];
                for (let currObj of data) {
                    if (currObj.attributes.external_references && currObj.attributes.external_references.source_name !== 'mitre-attack') {
                        extRefs = extRefs.concat(currObj.attributes.external_references);
                    }
                }
                this.allCitations = this.allCitations.concat(extRefs);
                this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
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

    public findRevokedBy(): void  {
        let filter = { 'stix.source_ref': this.attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                this.stixService.url = Constance.ATTACK_PATTERN_URL;
                this.target = data as Relationship[];
                this.target.forEach((relationship: Relationship) => {
                    if (relationship.attributes.relationship_type === 'revoked-by') {
                        this.foundRevoked = relationship.id;
                        this.origTarget = relationship.attributes.target_ref;
                    }
                });
                if (this.foundRevoked !== '') {
                    this.revokedBy = this.attackPatterns.find((p) => (p.id === this.origTarget));
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
    }

    public assignCitations(): void {
        for (let i in this.attackPattern.attributes.external_references) {
            this.attackPattern.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.attackPattern.attributes.external_references[i].citation = '[[Citation: ' + this.attackPattern.attributes.external_references[i].source_name + ']]';
            this.attackPattern.attributes.external_references[i].citeref = '[[CiteRef::' + this.attackPattern.attributes.external_references[i].source_name + ']]';
        }
        for (let i in this.courseOfAction.attributes.external_references) {
            this.courseOfAction.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.courseOfAction.attributes.external_references[i].citation = '[[Citation: ' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
            this.courseOfAction.attributes.external_references[i].citeref = '[[CiteRef::' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
        }
    }

    public getConfigs(phase = 'act'): void {
        let uniqPlatforms = [];
        let uri = Constance.CONFIG_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (res) => {
              if (res && res.length) {
                  for (let currRes of res) {
                      if (currRes.attributes.configKey === 'x_mitre_platforms') {
                          console.log(currRes.attributes.configValue);
                          uniqPlatforms = currRes.attributes.configValue;
                      }

                      if (currRes.attributes.configKey === 'x_mitre_data_sources') {
                          console.log(currRes.attributes.configValue);
                          this.dataSources = currRes.attributes.configValue;
                      }
                      if (currRes.attributes.configKey === 'tactics') {
                          for  (let currTactic of currRes.attributes.configValue) {
                              if (currTactic.phase === phase) {
                                  let found = this.attackPattern.attributes.kill_chain_phases.find((h) => {
                                      return h.phase_name === currTactic.tactic;
                                  });
                                  if (found) {
                                      if (currTactic.tactic === 'privilege-escalation') {
                                          this.tacticBools['privEsc'] = true;
                                      }
                                      if (currTactic.tactic === 'execution') {
                                          this.tacticBools['execution'] = true;
                                      }
                                      if (currTactic.tactic === 'defense-evasion') {
                                          this.tacticBools['defEvas'] = true;
                                      }
                                      if (currTactic.tactic === 'exfiltration') {
                                          this.tacticBools['exfil'] = true;
                                      }
                                      this.tactics.push({'name': currTactic.tactic, 'val': true});
                                  } else {
                                      this.tactics.push({'name': currTactic.tactic, 'val': false});
                                  }
                              }
                          }
                          this.tactics.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
                      }
                      if (currRes.attributes.configKey === 'references') {
                          this.allCitations = this.allCitations.concat(currRes.attributes.configValue);
                          this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                          this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
                      }
                  }
              }

              for (let currPlatform of uniqPlatforms) {
                  if (('x_mitre_platforms' in this.attackPattern.attributes) && this.attackPattern.attributes.x_mitre_platforms.includes(currPlatform)) {
                      this.platforms.push({'name': currPlatform, 'val': true});
                  } else {
                      this.platforms.push({'name': currPlatform, 'val': false});
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
    }

    public assignPerms(): void {
        if ('x_mitre_permissions_required' in this.attackPattern.attributes) {
            for (let i in this.permissions_req) {
                if (this.foundPermission(this.permissions_req[i]['name'])) {
                    this.permissions_req[i]['val'] = true;
                }
            }
        }
        if ('x_mitre_effective_permissions' in this.attackPattern.attributes) {
            for (let i in this.effective_perms) {
                if (this.foundEffectivePerm(this.effective_perms[i]['name'])) {
                    this.effective_perms[i]['val'] = true;
                }
            }
        }
    }

    public getContributors(): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currContributors = attackPattern.attributes.x_mitre_contributors;
            for (let i in currContributors) {
                this.contributors = this.contributors.concat(currContributors[i]);
            }
            this.contributors = this.contributors.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                ).sort().filter(Boolean);
        });
    }

    public getId(): void {
        if (this.mitreId !== undefined && this.mitreId !== '') {
            this.id = this.mitreId.external_id;
        } else {
            let ids = [];
            let allIds = [];
            this.attackPatterns.forEach((attackPattern: AttackPattern) => {
                for (let i in attackPattern.attributes.external_references) {
                    if (attackPattern.attributes.external_references[i].external_id) {
                        ids.push(attackPattern.attributes.external_references[i].external_id);
                    }
                }
            });
            allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                ).sort().filter(Boolean);
            this.id = 'T' + (parseInt(allIds[allIds.length - 1].substr(1)) + 1);
        }
    }

    public getNewCitation(refToAdd) {
        this.allCitations.push(refToAdd);
        this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
        this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
    }

    public addRemoveId() {
        this.addId = !this.addId;
    }

    public tacticChange(tactics) {
      this.tacticBools = tactics;
      if (!this.tacticBools['privEsc']) {
        delete this.attackPattern.attributes['x_mitre_effective_permissions'];
        for (let i in this.effective_perms) {
            this.effective_perms[i]['val'] = false;
        }
      }
      if (!this.tacticBools['execution']) {
        delete this.attackPattern.attributes['x_mitre_remote_support'];
      }
      if (!this.tacticBools['defEvas']) {
        delete this.attackPattern.attributes['x_mitre_defense_bypassed'];
      }
      if (!this.tacticBools['exfil']) {
        delete this.attackPattern.attributes['x_mitre_network_requirements'];
      }
    }

    public addRemovePlatform(platform: string) {
        if (!('x_mitre_platforms' in this.attackPattern.attributes)) {
            this.attackPattern.attributes.x_mitre_platforms = [];
            this.attackPattern.attributes.x_mitre_platforms.push(platform);
        } else {
            if ( this.foundPlatform(platform) ) {
                this.attackPattern.attributes.x_mitre_platforms = this.attackPattern.attributes.x_mitre_platforms.filter((p) => p !== platform);
                if (this.attackPattern.attributes.x_mitre_platforms.length === 0) {
                    this.attackPattern.attributes['x_mitre_platforms'] = [];
                    console.log(this.attackPattern.attributes.x_mitre_platforms);
                }
            } else {
                this.attackPattern.attributes.x_mitre_platforms.push(platform);
            }
        }
    }

    public addRemovePermission(permission: string) {
        if (!('x_mitre_permissions_required' in this.attackPattern.attributes)) {
            this.attackPattern.attributes.x_mitre_permissions_required = [];
            this.attackPattern.attributes.x_mitre_permissions_required.push(permission);
        } else {
            if ( this.foundPermission(permission) ) {
                this.attackPattern.attributes.x_mitre_permissions_required = this.attackPattern.attributes.x_mitre_permissions_required.filter((p) => p !== permission);
                if (this.attackPattern.attributes.x_mitre_permissions_required.length === 0) {
                    delete this.attackPattern.attributes['x_mitre_permissions_required'];
                }
            } else {
                this.attackPattern.attributes.x_mitre_permissions_required.push(permission);
            }
        }
    }

    public addRemoveEasy(answer: string) {
        this.attackPattern.attributes.x_mitre_difficulty_for_adversary = answer;
        for (let i in this.easyForAdversary) {
            if (this.easyForAdversary[i].name === answer) {
                this.easyForAdversary[i].val = true;
            }
            else {
                this.easyForAdversary[i].val = false;
            }
        }
    }

    public addRemoveDetectable(answer: string) {
        this.attackPattern.attributes.x_mitre_detectable_by_common_defenses = answer;
        for (let i in this.detectable) {
            if (this.detectable[i].name === answer) {
                this.detectable[i].val = true;
            }
            else {
                this.detectable[i].val = false;
            }
        }
    }

    public selectAllPlatforms(): void {
        this.attackPattern.attributes.x_mitre_platforms = [];
        for (let i in this.platforms) {
            this.platforms[i]['val'] = true;
            this.attackPattern.attributes.x_mitre_platforms.push(this.platforms[i].name);
        }
        console.log(this.attackPattern.attributes.x_mitre_platforms);
    }

    public removeAllPlatforms(): void {
        for (let i in this.platforms) {
            this.platforms[i]['val'] = false;
        }
        this.attackPattern.attributes['x_mitre_platforms'] = [];
        console.log(this.platforms);
        console.log(this.attackPattern.attributes.x_mitre_platforms);
    }

    public addRemoveEffectivePerm(permission: string) {
        if (!('x_mitre_effective_permissions' in this.attackPattern.attributes)) {
            this.attackPattern.attributes.x_mitre_effective_permissions = [];
            this.attackPattern.attributes.x_mitre_effective_permissions.push(permission);
        } else {
            if ( this.foundEffectivePerm(permission) ) {
                this.attackPattern.attributes.x_mitre_effective_permissions = this.attackPattern.attributes.x_mitre_effective_permissions.filter((p) => p !== permission);
                if (this.attackPattern.attributes.x_mitre_effective_permissions.length === 0) {
                    delete this.attackPattern.attributes['x_mitre_effective_permissions'];
                }
            } else {
                this.attackPattern.attributes.x_mitre_effective_permissions.push(permission);
            }
        }
    }

    public addMitigation(): void {
        this.mitigations.unshift({'id': '', 'name': '', 'description': ''});
    }

    public createNewMitigation(): void {
        this.newMitigations.unshift({'name': '', 'description': ''});
    }

    public removeMitigation(mitigation): void {
        this.mitigations = this.mitigations.filter((h) => h.name !== mitigation);
    }

    public removeNewMitigation(mitigation): void {
        this.newMitigations = this.newMitigations.filter((h) => h.name !== mitigation);
    }

    public addDataSource(): void {
        if (!('x_mitre_data_sources' in this.attackPattern.attributes)) {
            this.attackPattern.attributes.x_mitre_data_sources = [];
        }
        let dataSource = '';
        this.attackPattern.attributes.x_mitre_data_sources.unshift(dataSource);
    }

    public removeDataSource(dataSource): void {
        this.attackPattern.attributes.x_mitre_data_sources = this.attackPattern.attributes.x_mitre_data_sources.filter((h) => h !== dataSource)
    }

    public addContributor(): void {
        if (!('x_mitre_contributors' in this.attackPattern.attributes)) {
            this.attackPattern.attributes.x_mitre_contributors = [];
        }
        let contributorName = '';
        this.attackPattern.attributes.x_mitre_contributors.unshift(contributorName);
    }

    public removeContributor(contributor): void {
        this.attackPattern.attributes.x_mitre_contributors = this.attackPattern.attributes.x_mitre_contributors.filter((h) => h !== contributor);
    }

    public removeEmpties(): void {
        if ('x_mitre_contributors' in this.attackPattern.attributes) {
            this.removeContributor('');
            if (this.attackPattern.attributes.x_mitre_contributors.length === 0) {
                delete this.attackPattern.attributes['x_mitre_contributors'];
            }
        }
        if ('x_mitre_data_sources' in this.attackPattern.attributes) {
            this.attackPattern.attributes.x_mitre_data_sources = this.attackPattern.attributes.x_mitre_data_sources.filter((h) => h !== '');
            if (this.attackPattern.attributes.x_mitre_data_sources.length === 0) {
                delete this.attackPattern.attributes['x_mitre_data_sources'];
            }
        }
        if ('x_mitre_detection' in this.attackPattern.attributes) {
            if (this.attackPattern.attributes.x_mitre_detection === '') {
                delete this.attackPattern.attributes['x_mitre_detection'];
            }
        }
        if ('x_mitre_system_requirements' in this.attackPattern.attributes) {
            if (this.attackPattern.attributes.x_mitre_system_requirements === '') {
                delete this.attackPattern.attributes['x_mitre_system_requirements'];
            }
        }
        this.attackPattern.attributes.external_references = [];
    }

    public getMitreId(): void {
        for (let i in this.attackPattern.attributes.external_references) {
            if (this.attackPattern.attributes.external_references[i].external_id !== undefined) {
                this.mitreId = Object.assign({}, this.attackPattern.attributes.external_references[i]);
            }
        }
    }

    public addExtRefs(): void {
        let citationArr = super.matchCitations(this.attackPattern.attributes.description).concat(super.matchCitations(this.attackPattern.attributes.x_mitre_detection));
        if (this.mitreId !== undefined && this.mitreId.external_id !== '') {
            this.attackPattern.attributes.external_references.push(this.mitreId);
        }
        for (let name of citationArr) {
            let citation = this.allCitations.find((p) => p.source_name === name);
            if (citation !== undefined) {
                if (this.attackPattern.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                    this.attackPattern.attributes.external_references.push(citation);
                }
            }
        }
    }

    public saveCoursesOfAction(attackPatternId: string, citations: any): void {
        for (let mitigation of this.mitigations) {
            let foundMitigation = this.allMitStatic.find((p) => p.attributes.name === mitigation.name);
            if (foundMitigation.attributes.description !== mitigation.description) {
                foundMitigation.attributes.description = mitigation.description;
                foundMitigation.attributes.external_references = [];
                let citationArr = super.matchCitations(foundMitigation.attributes.description);
                for (let name of citationArr) {
                    let citation = citations.find((p) => p.source_name === name);
                    if (citation !== undefined) {
                        if (foundMitigation.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                            foundMitigation.attributes.external_references.push(citation);;
                        }        
                    }
                }
                this.stixService.url = Constance.COURSE_OF_ACTION_URL;
                let subscription = super.save(foundMitigation).subscribe(
                    (data) => {
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
            let origMit = this.origMitigations.find((p) => p.id === foundMitigation.id);
            this.origMitigations = this.origMitigations.filter((p) => p.id !== foundMitigation.id);
            if (origMit === undefined) {
                this.saveRelationship(attackPatternId, foundMitigation.id);
            }
        }

        for (let mitigation of this.origMitigations) {
            let relationship = this.allRels.find((p) => p.attributes.source_ref === mitigation.id);
            if (relationship !== undefined) {
                relationship.url = Constance.RELATIONSHIPS_URL;
                this.delete(relationship, false).subscribe(
                    () => {
        
                    }
                );
            }
        }

        for (let mitigation of this.newMitigations) {
            let coa = new CourseOfAction;
            coa.attributes.description = mitigation.description;
            coa.attributes.name = mitigation.name;
            coa.attributes.external_references = [];
            let citationArr = super.matchCitations(coa.attributes.description);
            for (let name of citationArr) {
                let citation = citations.find((p) => p.source_name === name);
                if (citation !== undefined) {
                    if (coa.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                        coa.attributes.external_references.push(citation);;
                    }   
                }
            }
            this.stixService.url = Constance.COURSE_OF_ACTION_URL;
            coa.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
            let subscription = super.create(coa).subscribe(
                (stixObject) => {
                    this.saveRelationship(attackPatternId, stixObject[0].id);
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
    }

    public saveRevokedDeleteOld(source_ref, target_ref): void {
        this.relationship.attributes.source_ref = source_ref;
        this.relationship.attributes.target_ref = target_ref;
        this.relationship.attributes.relationship_type = 'revoked-by';
        this.relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        this.stixService.url = Constance.RELATIONSHIPS_URL;
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
        let relationship = new Relationship();
        relationship.id = this.foundRevoked;
        relationship.url = Constance.RELATIONSHIPS_URL;
        this.delete(relationship, false).subscribe(
            () => {

            }
        );
    }

    public saveRevoked(source_ref, target_ref): void {
        if (this.revokedBy !== '') {
            this.relationship.attributes.source_ref = source_ref;
            this.relationship.attributes.target_ref = target_ref;
            this.relationship.attributes.relationship_type = 'revoked-by';
            this.relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
            if (this.foundRevoked === '') {
                this.stixService.url = Constance.RELATIONSHIPS_URL;
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
            else {
                this.relationship.id = this.foundRevoked;
                this.stixService.url = Constance.RELATIONSHIPS_URL;
                let subscription = super.save(this.relationship).subscribe(
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
        }
    }

    public saveAttackPattern(): void {
        this.removeEmpties();
        if (this.mitreId === '' || this.mitreId === undefined ) {
            if (this.addId) {
                this.mitreId = new ExternalReference();
                this.mitreId.external_id = this.id;
                this.mitreId.source_name = 'mitre-attack';
                this.mitreId.url = 'https://attack.mitre.org/wiki/Technique/' + this.id
            } else {
                this.mitreId = new ExternalReference();
                this.mitreId.source_name = 'mitre-attack';
            }
        } else {
            this.mitreId.external_id = this.id;
            this.mitreId.url = 'https://attack.mitre.org/wiki/Technique/' + this.id
        }
        this.addExtRefs();
        console.log(this.deprecated);
        if (this.deprecated === true) {
            this.attackPattern.attributes.x_mitre_deprecated = true;
        }
        else {
            if (this.attackPattern.attributes.x_mitre_deprecated !== undefined) {
                delete this.attackPattern.attributes['x_mitre_deprecated'];
            }
        }
        if (this.revoked === true) {
            this.attackPattern.attributes.revoked = true;
        }
        else {
            if (this.attackPattern.attributes.revoked !== undefined) {
                this.attackPattern.attributes.revoked = false;
            }
        }
        let sub = super.saveButtonClicked().subscribe(
            (data) => {
                console.log(data);
                this.saveCoursesOfAction(data.id, this.allCitations);
                if (this.revoked) {
                    if (this.origTarget === '' || this.origTarget === this.revokedBy.id) {
                        this.saveRevoked(data.id, this.revokedBy.id);
                    }
                    else {
                        this.saveRevokedDeleteOld(data.id, this.revokedBy.id);
                    }
                }
                else {
                    if (this.foundRevoked !== '') {
                        let relationship = new Relationship();
                        relationship.id = this.foundRevoked;
                        relationship.url = Constance.RELATIONSHIPS_URL;
                        this.delete(relationship, false).subscribe(
                            () => {
                
                            }
                        );
                    }
                }
                this.location.back();
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
}
