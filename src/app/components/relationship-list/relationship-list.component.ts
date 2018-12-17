import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Campaign, Indicator, AttackPattern, Relationship, Filter } from '../../models';
import { Constance } from '../../utils/constance';
import { BaseComponentService } from '../base-service.component';

@Component({
  selector: 'relationship-list',
  templateUrl: './relationship-list.component.html'
})
export class RelationshipListComponent implements OnInit, OnChanges {
    @Input() public model: any;
    public url: string;
    public relationshipMapping: any = [];
    public relationshipMappingTechniques: any = [];
    public relationshipMappingGroups: any = [];
    public relationshipMappingSoftware: any = [];
    public relationships: Relationship[];
    public tactics: any = [];
    public tacticsOrder: any = [];

    constructor(public baseComponentService: BaseComponentService, public router: Router) {
        console.dir(this.model);
    }

    public ngOnInit() {
        // this.loadRelationships({ target_ref: this.model.id});
        // this.loadRelationships({source_ref: this.model.id});
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.model.currentValue.id !== undefined) {
            this.relationshipMappingTechniques = {};
            this.relationshipMappingGroups = [];
            this.relationshipMappingSoftware = [];
            this.loadRelationships({ 'stix.target_ref': changes.model.currentValue.id });
            this.loadRelationships({ 'stix.source_ref': changes.model.currentValue.id });
        }
    }

    public loadRelationships(filter: any): void {
        let url = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let sub =  this.baseComponentService.get( encodeURI(url) ).subscribe(
        (data) => {
            this.relationships = data as Relationship[];
            let tactics_uri = Constance. X_MITRE_TACTIC_URL;
            let matrices_uri = Constance. X_MITRE_MATRIX_URL;
            let sub =  this.baseComponentService.get(tactics_uri).subscribe(
                (data) => {
                    let subscription =  this.baseComponentService.get(matrices_uri).subscribe(
                    (matrices_data) => {
                        for (let matrix of matrices_data) {
                            for (let ref of matrix.attributes.tactic_refs) {
                                let tactic = data.find((p) => (p.id === ref));
                                if (this.tacticsOrder.find((r) => r[0] === tactic.attributes.x_mitre_shortname) === undefined) {
                                    let domain = "Enterprise";
                                    if (matrix.attributes.external_references[0].external_id == "mobile-attack") {
                                        domain = "Mobile";
                                    }
                                    else if (matrix.attributes.external_references[0].external_id == "pre-attack") {
                                        domain = "PRE";
                                    }
                                    this.tacticsOrder.push([tactic.attributes.x_mitre_shortname, domain]);
                                }
                            }                                   
                        }}, (error) => {
                            console.log(error);
                        }, () => {
                            if (subscription) {
                                subscription.unsubscribe();
                            }
                        }
                    );
                    }, (error) => {
                        console.log(error);
                    }, () => {
                        if (sub) {
                            sub.unsubscribe();
                        }
                    }
                );
                this.relationships.forEach(
                    (relationship) => {
                        if (filter['stix.source_ref']) {
                            this.loadStixObject(relationship.attributes.target_ref, relationship.attributes.description);
                        } else {
                            this.loadStixObject(relationship.attributes.source_ref, relationship.attributes.description);
                        }
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

    public deleteRelationships(id: string): void {
        let relationship = this.relationships.find((r) => {
            return r.attributes.source_ref === id || r.attributes.target_ref === id ;
        });
        this.baseComponentService.delete(Constance.RELATIONSHIPS_URL, relationship.id).subscribe(
            () => {
                  this.relationships = this.relationships.filter((r) => r.id === relationship.id);
            }
        );
    }

    public saveRelationships(relationship: Relationship): void {
        this.baseComponentService.save(Constance.RELATIONSHIPS_URL, relationship).subscribe(
            (data) => {
               this.relationships.push( new Relationship(data));
            }
        );
    }

    public loadStixObject(id: string, description: string): void {
        if (id.indexOf('indicator') >= 0) {
            this.load(Constance.INDICATOR_URL, id);
        } else if (id.indexOf('attack-pattern') >= 0) {
            this.loadTechnique(Constance.ATTACK_PATTERN_URL, id, description);
        } else if (id.indexOf('campaign') >= 0) {
            this.load(Constance.CAMPAIGN_URL, id);
        } else if (id.indexOf('intrusion-set') >= 0) {
            this.loadGroups(Constance.INTRUSION_SET_URL, id, description);
        }  else if (id.indexOf('malware') >= 0) {
            this.loadSoftware(Constance.MALWARE_URL, id, description);
        }  else if (id.indexOf('tool') >= 0) {
            this.loadSoftware(Constance.TOOL_URL, id, description);
        }
    }

    public load(url: string, id: string ): void {
        const uri = `${url}/${id}`;
        let sub = this.baseComponentService.get(uri).subscribe(
            (data) => {
                data.attributes.description = this.formatAll(data.attributes.description);
                this.relationshipMapping.push(data);
                this.relationshipMapping = this.relationshipMapping.sort((a, b) => a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : 0);
            }, (error) => {
                console.log(error);
            }, () => {
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }

    public loadTechnique(url: string, id: string, description: string): void {
        const uri = `${url}/${id}`;
        let sub = this.baseComponentService.get(uri).subscribe(
            (data) => {
                data.attributes.description = this.formatAll(description);
                for (let phase of data.attributes.kill_chain_phases) {
                    if (this.relationshipMappingTechniques[phase.phase_name] === undefined) {
                        this.relationshipMappingTechniques[phase.phase_name] = [];
                    }
                    this.relationshipMappingTechniques[phase.phase_name].push(data);
                    this.relationshipMappingTechniques[phase.phase_name] = this.relationshipMappingTechniques[phase.phase_name].sort((a, b) => a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : 0);
                    if (this.tactics.find((r) => r === phase.phase_name) === undefined) {
                        this.tactics.push(phase.phase_name);
                    }
                    console.log(this.tactics);
                }
            }, (error) => {
                console.log(error);
            }, () => {
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }

    public loadGroups(url: string, id: string, description: string): void {
        const uri = `${url}/${id}`;
        let sub = this.baseComponentService.get(uri).subscribe(
            (data) => {
                data.attributes.description = this.formatAll(description);
                this.relationshipMappingGroups.push(data);
                this.relationshipMappingGroups = this.relationshipMappingGroups.sort((a, b) => a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : 0);
            }, (error) => {
                console.log(error);
            }, () => {
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }

    public loadSoftware(url: string, id: string, description: string): void {
        const uri = `${url}/${id}`;
        let sub = this.baseComponentService.get(uri).subscribe(
            (data) => {
                data.attributes.description = this.formatAll(description);
                this.relationshipMappingSoftware.push(data);
                this.relationshipMappingSoftware = this.relationshipMappingSoftware.sort((a, b) => a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : 0);
            }, (error) => {
                console.log(error);
            }, () => {
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }

    public getIcon(relationshipMap: any): string {
        let icon = '';
        if (relationshipMap.type === Constance.ATTACK_PATTERN_TYPE ) {
           icon = Constance.ATTACK_PATTERN_ICON;
        } else if (relationshipMap.type === Constance.CAMPAIGN_TYPE) {
           icon = Constance.CAMPAIGN_ICON;
        } else if (relationshipMap.type === Constance.INDICATOR_TYPE) {
            icon = Constance.INDICATOR_ICON;
        } else if (relationshipMap.type === Constance.INTRUSION_SET_TYPE) {
            icon = Constance.INTRUSION_SET_ICON;
        } else if (relationshipMap.type === Constance.MALWARE_TYPE) {
            icon = Constance.MALWARE_ICON;
        } else if (relationshipMap.type === Constance.TOOL_TYPE) {
            icon = Constance.TOOL_ICON;
        }
        return icon;
    }

     public getUrl(relationshipMap: any): string {
        let url = '';
        if (relationshipMap.type === Constance.ATTACK_PATTERN_TYPE ) {
           url = Constance.ATTACK_PATTERN_URL;
        } else if (relationshipMap.type === Constance.CAMPAIGN_TYPE) {
           url = Constance.CAMPAIGN_URL;
        } else if (relationshipMap.type === Constance.INDICATOR_TYPE) {
            url = Constance.INDICATOR_URL;
        } else if (relationshipMap.type === Constance.INTRUSION_SET_TYPE) {
            url = Constance.INTRUSION_SET_URL;
        } else if (relationshipMap.type === Constance.MALWARE_TYPE) {
            url = Constance.SOFTWARE_URL;
        } else if (relationshipMap.type === Constance.TOOL_TYPE) {
            url = Constance.SOFTWARE_URL;
        }
        return url.replace('api', '');
    }

     public getName(relationshipMap: any): string {
        let name = relationshipMap.attributes.name;
        if (relationshipMap.type === Constance.INDICATOR_TYPE) {
            name = relationshipMap.attributes.pattern;
        }
        return name;
    }

    public gotoDetail(relationshipMap: any): void {
        let url = relationshipMap.type + '/' + relationshipMap.id;
        this.router.navigateByUrl(url);
    }

    public mitreCitationsClean(inputString: string): string {
        return inputString ? inputString.replace(/\[\[Citation: ([^\]\]]*)\]\]/g, '(Citation: $1)') : '';
    }

    public mitreCiteRefClean(inputString: string): string {
        return inputString ? inputString.replace(/\[\[CiteRef::([^\]\]]*)\]\]/g, '(Citation: $1)') : '';
    }

    public mitreLinkClean(inputString: string): string {
        return inputString ? inputString.replace(/{{LinkById\|(.*?)}}/g, '$1') : '';
    }

    public tacticsClean(inputString: string): string {
        return inputString ? inputString.replace(/\[\[(.*?)\]\]/g, '$1') : '';
    }

    public formatAll(inputString) {
        return this.tacticsClean(this.mitreCitationsClean(this.mitreCiteRefClean(this.mitreLinkClean(inputString))));
    }
}
