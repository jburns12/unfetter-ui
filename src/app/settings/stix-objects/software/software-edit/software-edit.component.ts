import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar, MatRadioChange } from '@angular/material';
import { SoftwareComponent } from '../software/software.component';
import { StixService } from '../../../stix.service';
import { Malware, AttackPattern, Indicator, IntrusionSet, CourseOfAction, Filter, ExternalReference, Tool, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'software-set-edit',
  templateUrl: './software-edit.component.html',
  styleUrls: ['software-edit.component.scss']
})
export class SoftwareEditComponent extends SoftwareComponent implements OnInit {
    public attackPatterns: AttackPattern[] = [];
    public indicators: Indicator[] = [];
    public courseOfActions: CourseOfAction[] = [];
    public intrusionSets: IntrusionSet[] = [];
    public newRelationships: Relationship[] = [];
    public savedRelationships: Relationship[] = [];
    public deletedRelationships: Relationship[] = [];
    public allCitations: any = [];
    public contributors: string[] = [];
    public createNewOnly: boolean = true;
    public mitreId: any;
    public softwareTypes: string[] = ['Malware', 'Tool/Utility'];
    public softwareType: string = 'Malware';
    public origType: string = 'Malware';
    public addId: boolean = false;
    public malwares: Malware[];
    public tools: Tool[];
    public id: string;
    public idLink: string = "{{LinkById|";
    public deprecated: boolean = false;
    public revoked: boolean = false;
    public platforms: any = [];

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
        let testRoute: any;
        testRoute = this.route;
        if (testRoute.url.value[1].path.match(/^tool/)) {
            this.stixService.url = Constance.TOOL_URL;
            this.softwareType = 'Tool/Utility';
            this.origType = 'Tool/Utility';
        }
        const subscription =  super.get().subscribe(
            (data) => {
                this.malware = data;
                this.malware.attributes.external_references.reverse();
                console.log(this.malware);
                this.getGroups();
                this.getAllAliases();
                this.getCitationsAndContributors();
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
        if (this.malware.attributes.x_mitre_deprecated) {
            this.deprecated = this.malware.attributes.x_mitre_deprecated;
        }
    }

    public getRevoked(): void {
        if (this.malware.attributes.revoked) {
            this.revoked = this.malware.attributes.revoked;
        }
    }

    public typeChange(event: MatRadioChange) {
        this.softwareType = event.value;
        console.log(this.softwareType);
        console.log(this.allRels);
    }

    public addRemoveId() {
        this.addId = !this.addId;
    }

    public getNewCitation(refToAdd) {
        this.allCitations.push(refToAdd);
        this.allCitations = this.allCitations.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
        this.allCitations = this.allCitations.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
    }

    public addContributor(): void {
        if (!('x_mitre_contributors' in this.malware.attributes)) {
            this.malware.attributes.x_mitre_contributors = [];
        }
        let contributorName = '';
        this.malware.attributes.x_mitre_contributors.unshift(contributorName);
    }

    public removeContributor(contributor): void {
        this.malware.attributes.x_mitre_contributors = this.malware.attributes.x_mitre_contributors.filter((h) => h !== contributor);
    }

    public assignCitations(): void {
        for (let i in this.malware.attributes.external_references) {
            this.malware.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.malware.attributes.external_references[i].citation = '[[Citation: ' + this.malware.attributes.external_references[i].source_name + ']]';
            this.malware.attributes.external_references[i].citeref = '[[CiteRef::' + this.malware.attributes.external_references[i].source_name + ']]';
        }
    }

    public addRemovePlatform(platform: string) {
        if (!('x_mitre_platforms' in this.malware.attributes)) {
            this.malware.attributes.x_mitre_platforms = [];
            this.malware.attributes.x_mitre_platforms.push(platform);
        } else {
            if ( this.foundPlatform(platform) ) {
                this.malware.attributes.x_mitre_platforms = this.malware.attributes.x_mitre_platforms.filter((p) => p !== platform);
                if (this.malware.attributes.x_mitre_platforms.length === 0) {
                    this.malware.attributes['x_mitre_platforms'] = [];
                    console.log(this.malware.attributes.x_mitre_platforms);
                }
            } else {
                this.malware.attributes.x_mitre_platforms.push(platform);
            }
        }
    }

    public foundPlatform(platform: string): boolean {
        let found = this.malware.attributes.x_mitre_platforms.find((p) => {
            return p === platform;
        });
        return found ? true : false;
    }

    public selectAllPlatforms(): void {
        this.malware.attributes.x_mitre_platforms = [];
        for (let i in this.platforms) {
            this.platforms[i]['val'] = true;
            this.malware.attributes.x_mitre_platforms.push(this.platforms[i].name);
        }
        console.log(this.malware.attributes.x_mitre_platforms);
    }

    public removeAllPlatforms(): void {
        for (let i in this.platforms) {
            this.platforms[i]['val'] = false;
        }
        this.malware.attributes['x_mitre_platforms'] = [];
        console.log(this.platforms);
        console.log(this.malware.attributes.x_mitre_platforms);
    }

    public getCitationsAndContributors(): void {
        let uri = Constance.MULTIPLES_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let extRefs = [];
                for (let currObj of data) {
                    if (currObj.attributes.external_references && currObj.attributes.external_references.source_name !== 'mitre-attack') {
                        extRefs = extRefs.concat(currObj.attributes.external_references);
                    }
                    this.contributors = this.contributors.concat(currObj.attributes.x_mitre_contributors);
                }
                let configUri = Constance.CONFIG_URL;
                let uniqPlatforms = [];
                let subscript =  super.getByUrl(configUri).subscribe(
                    (res) => {
                        if (res && res.length) {
                            for (let currRes of res) {
                                if (currRes.attributes.configKey === 'references') {
                                  extRefs = extRefs.concat(currRes.attributes.configValue);
                                }
                                if (currRes.attributes.configKey === 'x_mitre_platforms') {
                                    console.log(currRes.attributes.configValue);
                                    uniqPlatforms = currRes.attributes.configValue;
                                }
                            }
                        }
                        extRefs = extRefs.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                        this.allCitations = extRefs.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
                        for (let currPlatform of uniqPlatforms) {
                            if (('x_mitre_platforms' in this.malware.attributes) && this.malware.attributes.x_mitre_platforms.includes(currPlatform)) {
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
                        if (subscript) {
                            subscript.unsubscribe();
                        }
                    }
                );
                this.contributors = this.contributors.filter((elem, index, self) => self.findIndex((t) => t === elem) === index).sort().filter(Boolean);
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

    public addAliasesToMalware(): void {
        this.malware.attributes.x_mitre_aliases = [];
        this.malware.attributes.x_mitre_aliases.push(this.malware.attributes.name);
        if (this.aliases.length > 0) {
            for (let alias of this.aliases){
                if (alias.name !== '') {
                    this.malware.attributes.x_mitre_aliases.push(alias.name);
                    if (alias.description !== '') {
                        let extRef = new ExternalReference();
                        extRef.source_name = alias.name;
                        extRef.description = alias.description;
                        this.malware.attributes.external_references.push(extRef);
                    }
                }
            }
        }
        console.log(this.malware.attributes.x_mitre_aliases);
    }

    public createRelationships(id: string): void {
        for (let technique of this.addedTechniques) {
            let currTechnique = this.techniques.filter((h) => h.name === technique.name);
            if (currTechnique.length > 0) {
                this.saveRelationship(id, currTechnique[0].id, technique.description, technique.relationship);
            }
            this.origRels = this.origRels.filter((h) => h.id !== technique.relationship);
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
            if (description == '') {
                relationship.attributes.external_references = [];
                relationship.attributes.description = description;
            }
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

    public createRelationshipsGroups(id: string): void {
        console.log(this.allRels);
        for (let rel of this.allRels) {
            let relationship = new Relationship();
            relationship.attributes.source_ref = rel.attributes.source_ref;
            relationship.attributes.target_ref = id;
            relationship.attributes.x_mitre_collections = ['95ecc380-afe9-11e4-9b6c-751b66dd541e'];
            if (rel.attributes.description !== '') {
                relationship.attributes.external_references = rel.attributes.external_references;
                relationship.attributes.description = rel.attributes.description;
            }
            relationship.attributes.relationship_type = 'uses';
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

    public removeRelationships(id: string, deleteRel: boolean = true): void {
        for (let rel of this.origRels) {
            this.allRels = this.allRels.filter((h) => h.id !== rel.attributes.id);
            if (deleteRel) {
                rel.url = Constance.RELATIONSHIPS_URL;
                rel.id = rel.attributes.id;
                this.delete(rel).subscribe(
                    () => {
                    }
                );
            }
        }
    }

    public removeContributors(): void {
        if ('x_mitre_contributors' in this.malware.attributes) {
            this.removeContributor('');
            if (this.malware.attributes.x_mitre_contributors.length === 0) {
                delete this.malware.attributes['x_mitre_contributors'];
            }
        }
    }

    public getMitreId(): void {
        for (let i in this.malware.attributes.external_references) {
            if (this.malware.attributes.external_references[i].external_id !== undefined) {
                this.mitreId = Object.assign({}, this.malware.attributes.external_references[i]);
            }
        }
    }

    public getIdString(ids: any): string {
        let idStr = '';
        idStr = '' + (parseInt(ids[ids.length - 1].substr(1)) + 1);
        let numZeroes = 4 - idStr.length;
        for (let i = 0; i < numZeroes; i++) {
          idStr = '0' + idStr;
        }
        idStr = 'S' + idStr;
        return idStr;
    }

    public getToolIds(ids: any) {
        this.stixService.url = Constance.TOOL_URL;
        let subscription = super.load().subscribe(
            (data) => {
                this.tools = data as Tool[];
                let allIds = [];
                this.tools.forEach((tool: Tool) => {
                    for (let i in tool.attributes.external_references) {
                        if (tool.attributes.external_references[i].external_id) {
                            ids.push(tool.attributes.external_references[i].external_id);
                        }
                    }
                });
                allIds = ids.filter((elem, index, self) => self.findIndex((t) => t === elem) === index
                    ).sort().filter(Boolean);
                this.id = this.getIdString(allIds);
                this.stixService.url = Constance.MALWARE_URL;
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

    public getId(): void {
        if (this.mitreId !== undefined && this.mitreId !== '') {
            this.id = this.mitreId.external_id;
        } else {
            let subscription = super.load().subscribe(
                (data) => {
                    this.malwares = data as Malware[];
                    let ids = [];
                    let allIds = [];
                    this.malwares.forEach((malware: Malware) => {
                        for (let i in malware.attributes.external_references) {
                            if (malware.attributes.external_references[i].external_id) {
                                ids.push(malware.attributes.external_references[i].external_id);
                            }
                        }
                    });
                    this.getToolIds(ids);
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

    public addExtRefs(): void {
        let citationArr = super.matchCitations(this.malware.attributes.description);
        for (let ref of this.malware.attributes.external_references) {
            if (ref.description !== undefined) {
                citationArr = citationArr.concat(super.matchCitations(ref.description));
            }
        }
        if (this.mitreId !== undefined && this.mitreId.external_id !== '') {
            this.malware.attributes.external_references.push(this.mitreId);
        }
        for (let name of citationArr) {
            let citation = this.allCitations.find((p) => p.source_name === name);
            console.log(citation);
            if (citation !== undefined) {
                if (this.malware.attributes.external_references.find((p) => p.source_name === name) === undefined) {
                    this.malware.attributes.external_references.push(citation);
                }
            }
        }
    }

    public saveMalware(): void {
        if (this.mitreId === '' || this.mitreId === undefined ) {
            if (this.addId) {
                this.mitreId = new ExternalReference();
                this.mitreId.external_id = this.id;
                this.mitreId.source_name = 'mitre-attack';
                this.mitreId.url = 'https://attack.mitre.org/wiki/Software/' + this.id
            } else {
                this.mitreId = new ExternalReference();
                this.mitreId.source_name = 'mitre-attack';
            }
        } else {
            this.mitreId.external_id = this.id;
            this.mitreId.url = 'https://attack.mitre.org/wiki/Software/' + this.id
        }
        this.malware.attributes.external_references = [];
        this.addAliasesToMalware();
        this.addExtRefs();
        this.removeContributors();
        if (this.deprecated === true) {
            this.malware.attributes.x_mitre_deprecated = true;
        }
        else {
            if (this.malware.attributes.x_mitre_deprecated !== undefined) {
                delete this.malware.attributes['x_mitre_deprecated'];
            }
        }
        if (this.revoked === true) {
            this.malware.attributes.revoked = true;
        }
        else {
            if (this.malware.attributes.revoked !== undefined) {
                this.malware.attributes.revoked = false;
            }
        }
        if (this.softwareType === 'Tool/Utility') {
            this.stixService.url = Constance.TOOL_URL;
        } else {
            this.stixService.url = Constance.MALWARE_URL;
        }
        if (this.origType === this.softwareType) {
            let sub = super.saveButtonClicked().subscribe(
                (data) => {
                    this.location.back();
                    this.createRelationships(data.id);
                    this.removeRelationships(data.id);
                    console.log(this.allRels);
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
        } else {
            console.log(this.malware);
            let newObj = Object.assign({}, this.malware);
            delete newObj['id'];
            delete newObj.attributes['id'];
            delete newObj['links'];
            if (this.softwareType === 'Malware') {
                newObj.type = 'malware';
                newObj.attributes.labels = ['malware'];
                newObj.url = Constance.MALWARE_URL;
                this.stixService.url = Constance.MALWARE_URL;
                this.malware.url = Constance.TOOL_URL;
            } else {
                newObj.type = 'tool';
                newObj.attributes.labels = ['tool'];
                newObj.url = Constance.TOOL_URL;
                this.stixService.url = Constance.TOOL_URL;
                this.malware.url = Constance.MALWARE_URL;
            }
            for (let i in this.addedTechniques) {
                this.addedTechniques[i].relationship = '';
            }
            let sub = super.create(newObj).subscribe(
                (stixObject) => {
                    console.log(stixObject);
                    this.createRelationships(stixObject[0].id);
                    this.removeRelationships(stixObject[0].id, false);
                    this.createRelationshipsGroups(stixObject[0].id);
                    this.delete(this.malware, false).subscribe(
                        () => {
                            this.router.navigate(['stix/softwares']);
                        }
                    );
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

    public found(list: any[], object: any): any {
        return list.find( (entry) => { return entry.id === object.id; } );
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

    public filterOptions(stringToMatch: string, listToParse: any): void {
        if (stringToMatch) {
            let filterVal = stringToMatch.toLowerCase();
            return listToParse.filter((h) => h.toLowerCase().startsWith(filterVal));
        }
        return listToParse;
    }

    public loadObject(url: string, id: string, list: any ): void {
        const uri = `${url}/${id}`;
        let sub = super.getByUrl(uri).subscribe(
            (data) => {
                list.push(data);
            }, (error) => {
                console.log(error);
            }, () => {
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }
}
