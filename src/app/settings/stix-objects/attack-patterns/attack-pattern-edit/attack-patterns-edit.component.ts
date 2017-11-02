import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { AttackPatternComponent } from '../attack-pattern/attack-pattern.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, ExternalReference, KillChainPhase } from '../../../../models';
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
    public attackPatterns: AttackPattern[];
    public tacticBools: any = {'privEsc': false, 'execution': false, 'defEvas': false, 'exFil': false};
    public supportsRemoteReqNet: any = [
        {'label': 'Yes        ', 'value': true},
        {'label': 'No', 'value': false}
    ];
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
               this.getPlatforms();
               this.getContributors();
               this.getDataSources();
               this.assignPerms();
               this.findCoA();
               super.getCitations();
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

    public filterOptions(stringToMatch: string, listToParse: any): void {
        if (stringToMatch) {
            let filterVal = stringToMatch.toLowerCase();
            return listToParse.filter((h) => h.toLowerCase().startsWith(filterVal));
        }
        return listToParse;
    }

    public getPlatforms(): void {
        let allPlatforms = [];
        let uniqPlatforms = [];
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currPlatforms = attackPattern.attributes.x_mitre_platforms;
            for (let i in currPlatforms) {
                allPlatforms = allPlatforms.concat(currPlatforms[i]);
            }
            uniqPlatforms = allPlatforms.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                ).sort().filter(Boolean);
        });
        for (let currPlatform of uniqPlatforms) {
            if (('x_mitre_platforms' in this.attackPattern.attributes) && this.attackPattern.attributes.x_mitre_platforms.includes(currPlatform)) {
                this.platforms.push({'name': currPlatform, 'val': true});
            } else {
                this.platforms.push({'name': currPlatform, 'val': false});
            }
        }
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

    public getDataSources(): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let currDataSources = attackPattern.attributes.x_mitre_data_sources;
            for (let i in currDataSources) {
                this.dataSources = this.dataSources.concat(currDataSources[i]);
            }
            this.dataSources = this.dataSources.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                ).sort().filter(Boolean);
        });
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
        console.log(this.id);
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
        this.attackPattern.attributes.x_mitre_contributors = this.attackPattern.attributes.x_mitre_contributors.filter((h) => h !== contributor)
    }

    public removeEmpties(): void {
        if ('x_mitre_contributors' in this.attackPattern.attributes) {
            if (this.attackPattern.attributes.x_mitre_contributors.length === 0) {
                delete this.attackPattern.attributes['x_mitre_contributors'];
            }
        }
        if ('x_mitre_data_sources' in this.attackPattern.attributes) {
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
        for (let i in this.attackPattern.attributes.external_references){
            if('citeButton' in this.attackPattern.attributes.external_references[i]) {
                delete this.attackPattern.attributes.external_references[i].citeButton;
            }
            if('citation' in this.attackPattern.attributes.external_references[i]) {
                delete this.attackPattern.attributes.external_references[i].citation;
            }
            if('citeref' in this.attackPattern.attributes.external_references[i]) {
                delete this.attackPattern.attributes.external_references[i].citeref;
            }
        }
    }

    public saveAttackPattern(): void {
        this.attackPattern.attributes.external_references.reverse();
        this.removeEmpties();
        let sub = super.saveButtonClicked().subscribe(
            (data) => {
                console.log(data);
                this.saveCourseOfAction(data.id);
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
