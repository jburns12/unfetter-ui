import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdDialogConfig, MdSnackBar } from '@angular/material';
import { IntrusionSetComponent } from '../intrusion-set/intrusion-set.component';
import { StixService } from '../../../stix.service';
import { ExternalReference } from '../../../../models';
import { Motivation } from '../../../../models/motivation.enum';
import { ResourceLevel } from '../../../../models/resource-level.enum';
import { SortHelper } from '../../../../assessments/assessments-summary/sort-helper';
import { Constance } from '../../../../utils/constance';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import {
  IntrusionSet,
  AttackPattern,
  Identity,
  ThreatActor,
  Relationship
} from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'intrusion-set-edit',
  templateUrl: './intrusion-set-edit.component.html',
})
export class IntrusionSetEditComponent extends IntrusionSetComponent implements OnInit {
    public motivations = new Set(Motivation.values().map((el) => el.toString()).sort(SortHelper.sortDesc()));
    public resourceLevels = new Set(ResourceLevel.values().map((el) => el.toString()).sort(SortHelper.sortDesc()));
    public motivationCtrl: FormControl;
    public resourceLevelCtrl: FormControl;
    public addedTechniques: any = [];
    public techniques: string[] = [];
    public addedSoftwares: any = [];
    public softwares: string[] = [];

    public labels = [
        {label: 'activist'},
        {label: 'competitor'},
        {label: 'crime-syndicate'},
        {label: 'criminal'},
        {label: 'hacker'},
        {label: 'insider-accidental'},
        {label: 'insider-disgruntled'},
        {label: 'nation-state'},
        {label: 'sensationalist'},
        {label: 'spy'},
        {label: 'terrorist'}
    ];
    public attackPatterns: AttackPattern[] = [];
    public identities: Identity[] = [];
    public threatActors: ThreatActor[] = [];

   constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location,
        public snackBar: MdSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.motivationCtrl = new FormControl();
        this.resourceLevelCtrl = new FormControl();
    }

    public ngOnInit() {
       super.loadIntrusionSet();
       this.getTechniques();
       this.getSoftware();
    }

    public isChecked(label: string): boolean {
        const found = this.intrusionSet.attributes.labels.find((l) => {
            return l === label;
        });
        return found ? true : false;
    }

    public addLabel(label: string) {
        this.intrusionSet.attributes.labels.push(label);
    }

    public saveIdentity(): void {
         this.addAliasesToIntrusionSet();
         const sub = super.saveButtonClicked().subscribe(
            (data) => {
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

    public addAliasesToIntrusionSet(): void{
        for (let alias of this.aliases){
            this.intrusionSet.attributes.aliases.push(alias.name);
        }
        for (let alias of this.aliases){
            let extRef = new ExternalReference();
            extRef.source_name = alias.name;
            extRef.description = alias.description;
            this.intrusionSet.attributes.external_references.push(extRef);
        }
    }

    public getTechniques(): void{
        let subscription =  super.getByUrl(Constance.ATTACK_PATTERN_URL).subscribe(
            (data) => {
                let target = data as AttackPattern[];
                target.forEach((attackPattern: AttackPattern) => {
                    this.techniques.push({'name': attackPattern.attributes.name, 'id': attackPattern.id);
                });
                this.techniques = this.techniques.sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
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

    public getSoftware(): void {
        let subscription =  super.getByUrl(Constance.MALWARE_URL).subscribe(
            (data) => {
                let target = data as Malware[];
                target.forEach((malware: Malware) => {
                    this.softwares.push({'name': malware.attributes.name, 'id': malware.id);
                });
                this.getTools();
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

    public getTools(): void {
        let subscription =  super.getByUrl(Constance.TOOL_URL).subscribe(
            (data) => {
                let target = data as Tool[];
                target.forEach((tool: Tool) => {
                    this.softwares.push({'name': tool.attributes.name, 'id': tool.id);
                });
                this.softwares = this.softwares.sort((a,b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
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

    public createRelationships(id: string): void {
        for(let technique of this.addedTechniques){
            let currTechnique = this.techniques.filter((h) => h.name === technique.name);
            this.saveRelationship(id, currTechnique[0].id, technique.description);
        }
        for(let software of this.addedSoftwares){
            let currSoftware = this.softwares.filter((h) => h.name === software.name);
            this.saveRelationship(id, currSoftware[0].id, software.description);
        }
    }

    public saveRelationship(source_ref: string, target_ref: string, description: string): void {
        let relationship = new Relationship();
        relationship.attributes.source_ref = source_ref;
        relationship.attributes.target_ref = target_ref;
        relationship.attributes.description = description;
        relationship.attributes.relationship_type = "uses";
        console.log(relationship);
        let subscription = super.create(relationship).subscribe(
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

    public addTechnique(): void {
        let currTechnique = {};
        currTechnique['name'] = '';
        currTechnique['description'] = '';
        this.addedTechniques.push(currTechnique);
    }

    public removeTechnique(technique): void {
        this.addedTechniques = this.addedTechniques.filter((h) => h.name !== technique);
    }

    public addSoftware(): void {
        let currSoftware = {};
        currSoftware['name'] = '';
        currSoftware['description'] = '';
        this.addedSoftwares.push(currSoftware);
    }

    public removeSoftware(software): void {
        this.addedSoftwares = this.addedSoftwares.filter((h) => h.name !== software);
    }

    public addAlias(): void {
        let alias = {};
        alias['name'] = '';
        alias['description'] = '';
        this.aliases.push(alias);
    }

    public removeAlias(alias): void {
        this.aliases = this.aliases.filter((h) => h.name !== alias);
    }

    private found(list: any[], object: any): any {
        return list.find( (entry) => entry.id === object.id );
    }
}
