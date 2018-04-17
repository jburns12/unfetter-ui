import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
import { IntrusionSetComponent } from '../intrusion-set/intrusion-set.component';
import { StixService } from '../../../stix.service';
import { ExternalReference } from '../../../../models';
import { Motivation } from '../../../../models/motivation.enum';
import { ResourceLevel } from '../../../../models/resource-level.enum';
import { SortHelper } from '../../../../assessments/assessments-summary/sort-helper';
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
    public editComponent: boolean = true;
    public idLink: string = "{{LinkById|";

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
    public contributors: string[] = [];
    public allCitations: any = [];
    public createNewOnly: boolean = true;
    public addId: boolean = false;

   constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.motivationCtrl = new FormControl();
        this.resourceLevelCtrl = new FormControl();
    }

    public ngOnInit() {
       super.loadIntrusionSet();
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

    public addRemoveId() {
        this.addId = !this.addId;
    }

    public getNewCitation(refToAdd) {
        this.allCitations.push(refToAdd);
        this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
        this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
    }

    public addExtRefs(): void {
        let citationArr = super.matchCitations(this.intrusionSet.attributes.description);
        if (this.mitreId !== undefined && this.mitreId.external_id !== '') {
            this.intrusionSet.attributes.external_references.push(this.mitreId);
        }
        console.log(citationArr);
        console.log(this.allCitations);
        for (let name of citationArr) {
            let citation = this.allCitations.find((p) => p.source_name === name);
            console.log(citation);
            if (citation !== undefined) {
                if (this.intrusionSet.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                    this.intrusionSet.attributes.external_references.push(citation);
                }
            }
        }
    }

    public saveIdentity(): void {
        if (this.mitreId === '' || this.mitreId === undefined ) {
            if (this.addId) {
                this.mitreId = new ExternalReference();
                this.mitreId.external_id = this.id;
                this.mitreId.source_name = 'mitre-attack';
                this.mitreId.url = 'https://attack.mitre.org/wiki/Group/' + this.id
            } else {
                this.mitreId = new ExternalReference();
                this.mitreId.source_name = 'mitre-attack';
            }
        } else {
            this.mitreId.external_id = this.id;
            this.mitreId.url = 'https://attack.mitre.org/wiki/Group/' + this.id
        }
        this.intrusionSet.attributes.external_references = [];
        this.addExtRefs();
        this.addAliasesToIntrusionSet();
        if (this.deprecated === true) {
            this.intrusionSet.attributes.x_mitre_deprecated = true;
        }
        else {
            if (this.intrusionSet.attributes.x_mitre_deprecated !== undefined) {
                delete this.intrusionSet.attributes['x_mitre_deprecated'];
            }
        }
        const sub = super.saveButtonClicked().subscribe(
            (data) => {
                this.location.back();
                this.createRelationships(data.id);
                this.removeRelationships(data.id);
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

    public addAliasesToIntrusionSet(): void {
        this.intrusionSet.attributes.aliases.push(this.intrusionSet.attributes.name);
        for (let alias of this.aliases){
            this.intrusionSet.attributes.aliases.push(alias.name);
        }
        for (let alias of this.aliases){
            if (alias.description !== '') {
                let extRef = new ExternalReference();
                extRef.source_name = alias.name;
                extRef.description = alias.description;
                this.intrusionSet.attributes.external_references.push(extRef);
            }
        }
    }

    public createRelationships(id: string): void {
        console.log(this.origRels);
        console.log(this.addedTechniques);
        for (let technique of this.addedTechniques){
            let currTechnique = this.techniques.filter((h) => h.name === technique.name);
            if (currTechnique.length > 0) {
                this.saveRelationship(id, currTechnique[0].id, technique.description, technique.relationship);
                this.origRels = this.origRels.filter((h) => h.id !== technique.relationship);
            }
        }
        for (let software of this.addedSoftwares){
            let currSoftware = this.softwares.filter((h) => h.name === software.name);
            if (currSoftware.length > 0) {
                this.saveRelationship(id, currSoftware[0].id, software.description, software.relationship);
                this.origRels = this.origRels.filter((h) => h.id !== software.relationship);
            }
        }
    }

    public saveRelationship(source_ref: string, target_ref: string, description: string, id: string): void {
        let relationship = new Relationship();
        relationship.attributes.source_ref = source_ref;
        relationship.attributes.target_ref = target_ref;
        relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
        if (description !== '') {
            relationship.attributes.external_references = [];
            relationship.attributes.description = description;
            let citationArr = super.matchCitations(relationship.attributes.description);
            for (let name of citationArr) {
                let citation = this.allCitations.find((p) => p.source_name === name);
                if (citation !== undefined) {
                    relationship.attributes.external_references.push(citation);
                }
            }
        }
        relationship.attributes.relationship_type = 'uses';
        if (id !== '') {
            relationship.id = id;
            console.log(relationship);
            this.stixService.url = Constance.RELATIONSHIPS_URL;
            let subscription = super.save(relationship).subscribe(
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
        } else {
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
    }

    public removeRelationships(id: string): void {
        for (let rel of this.origRels){
            rel.url = Constance.RELATIONSHIPS_URL;
            rel.id = rel.attributes.id;
            this.delete(rel).subscribe(
                () => {
                }
            );
        }
    }

    public addTechnique(): void {
        let currTechnique = {};
        currTechnique['name'] = '';
        currTechnique['description'] = '';
        currTechnique['relationship'] = '';
        this.addedTechniques.unshift(currTechnique);
        this.currTechniques.unshift(this.techniques);
        for (let i in this.addedTechniques) {
            this.currTechniques[0] = this.currTechniques[0].filter((h) => h.name !== this.addedTechniques[i].name);
        }
        console.log(this.currTechniques);
    }

    public removeTechnique(technique: string, i: number): void {
        this.addedTechniques = this.addedTechniques.filter((h) => h.name !== technique);
        this.currTechniques.splice(i, 1);
        for (let index in this.currTechniques) {
            this.currTechniques[index] = this.techniques;
            for (let j in this.addedTechniques) {
                if (j !== index) {
                    this.currTechniques[index] = this.currTechniques[index].filter((h) => h.name !== this.addedTechniques[j].name)
                }
            }
        }
    }

    public addSoftware(): void {
        let currSoftware = {};
        currSoftware['name'] = '';
        currSoftware['description'] = '';
        currSoftware['relationship'] = '';
        this.addedSoftwares.unshift(currSoftware);
        this.currSoftwares.unshift(this.softwares);
        for (let i in this.addedSoftwares) {
            this.currSoftwares[0] = this.currSoftwares[0].filter((h) => h.name !== this.addedSoftwares[i].name);
        }
        console.log(this.currSoftwares);
    }

    public removeSoftware(software: string, i: number): void {
        this.addedSoftwares = this.addedSoftwares.filter((h) => h.name !== software);
        this.currSoftwares.splice(i, 1);
        for (let index in this.currSoftwares) {
            this.currSoftwares[index] = this.softwares;
            for (let j in this.addedSoftwares) {
                if (j !== index) {
                    this.currSoftwares[index] = this.currSoftwares[index].filter((h) => h.name !== this.addedSoftwares[j].name)
                }
            }
        }
    }

    public addAlias(): void {
        let alias = {};
        alias['name'] = '';
        alias['description'] = '';
        this.aliases.unshift(alias);
    }

    public removeAlias(alias): void {
        this.aliases = this.aliases.filter((h) => h.name !== alias);
    }

    public checkAddedTechniques(): void {
        for (let index in this.currTechniques) {
            this.currTechniques[index] = this.techniques;
            for (let i in this.addedTechniques) {
                if (i !== index) {
                    this.currTechniques[index] = this.currTechniques[index].filter((h) => h.name !== this.addedTechniques[i].name)
                }
            }
        }
        console.log(this.currTechniques);
    }

    public checkAddedSoftwares(): void {
        for (let index in this.currSoftwares) {
            this.currSoftwares[index] = this.softwares;
            for (let i in this.addedSoftwares) {
                if (i !== index) {
                    this.currSoftwares[index] = this.currSoftwares[index].filter((h) => h.name !== this.addedSoftwares[i].name)
                }
            }
        }
        console.log(this.currSoftwares);
    }

    public addContributor(): void {
        if (!('x_mitre_contributors' in this.intrusionSet.attributes)) {
            this.intrusionSet.attributes.x_mitre_contributors = [];
        }
        let contributorName = '';
        this.intrusionSet.attributes.x_mitre_contributors.unshift(contributorName);
    }

    public removeContributor(contributor): void {
        this.intrusionSet.attributes.x_mitre_contributors = this.intrusionSet.attributes.x_mitre_contributors.filter((h) => h !== contributor);
    }

    public filterOptions(stringToMatch: string, listToParse: any): void {
        if (stringToMatch) {
            let filterVal = stringToMatch.toLowerCase();
            return listToParse.filter((h) => h.toLowerCase().startsWith(filterVal));
        }
        return listToParse;
    }

    private found(list: any[], object: any): any {
        return list.find( (entry) => entry.id === object.id );
    }
}
