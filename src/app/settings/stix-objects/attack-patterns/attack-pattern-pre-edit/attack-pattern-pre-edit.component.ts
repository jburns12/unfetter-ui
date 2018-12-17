import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AttackPatternEditComponent } from '../attack-pattern-edit/attack-patterns-edit.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, CourseOfAction, ExternalReference, Relationship } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
    selector: 'attack-pattern-pre-edit',
    templateUrl: './attack-pattern-pre-edit.component.html'
})
export class AttackPatternPreEditComponent extends AttackPatternEditComponent implements OnInit {
    public attackPatterns: any;
    public techniques: any = [];
    public addedTechniques: any = [];
    public currTechniques: any = [];
    public origRels: any = [];

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
      //let filter = 'sort=' + encodeURIComponent(JSON.stringify({ 'stix.name': '1' }));
      let subscription = super.load().subscribe(
          (data) => {
              console.log(this.attackPattern);
              this.attackPatterns = data as AttackPattern[];
              this.getConfigs('pre-attack');
              this.getTechniques(false);
              this.getContributors();
              this.findRevokedBy();
              this.getCitations();
              this.assignCitations();
              this.getMitreId();
              this.getId();
              this.getDeprecated();
              this.getRevoked();
              this.setAttributes();
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

    public setAttributes(): void {
        for (let i in this.easyForAdversary) {
            if (this.easyForAdversary[i].name === this.attackPattern.attributes.x_mitre_difficulty_for_adversary) {
                this.easyForAdversary[i].val = true;
            } else {
                this.easyForAdversary[i].val = false;
            }
        }

        for (let i in this.detectable) {
            if (this.detectable[i].name === this.attackPattern.attributes.x_mitre_detectable_by_common_defenses) {
                this.detectable[i].val = true;
            } else {
                this.detectable[i].val = false;
            }
        }
    }

    public getTechniques(create: boolean): void {
        this.attackPatterns.forEach((attackPattern: AttackPattern) => {
            let id = 'No ID';
            for (let ref of attackPattern.attributes.external_references) {
                if (ref.source_name === 'mitre-pre-attack' || ref.source_name === 'mitre-attack' || ref.source_name === 'mitre-mobile-attack') {
                    id = ref.external_id;
                }
            }
            this.techniques.push({'name': attackPattern.attributes.name + ' - ' + id, 'id': attackPattern.id, 'extRefs': attackPattern.attributes.external_references});
        });
        this.techniques = this.techniques.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
        if (!create) {
            this.findRelationships();
        }
    }

    public findRelationships(): void {
        let filter = { 'stix.source_ref': this.attackPattern.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let targetFirst = data as Relationship[];
                let tech = [];
                let targetTech = [];
                console.log(data);
                console.log(this.techniques);
                targetFirst.forEach((rel: Relationship) => {
                    if (rel.attributes.relationship_type === 'related-to') {
                        this.origRels.push(rel);
                        tech.push({'technique': this.techniques.find((h) => h.id === rel.attributes.target_ref), 'relationship': rel});
                    }
                });
                let filter2 = { 'stix.target_ref': this.attackPattern.id };
                let newUri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter2);
                let subscription2 =  super.getByUrl(newUri).subscribe(
                    (data2) => {
                        let target = data2 as Relationship[];
                        let i = 0;
                        target.forEach((relationship: Relationship) => {
                            if (relationship.attributes.relationship_type === 'related-to') {
                                this.origRels.push(relationship);                            }
                        });
                        console.log(tech);
                        tech.forEach((technique: any) => {
                            this.addedTechniques.push({'name': technique.technique.name, 'relationship': technique.relationship.id});
                            console.log(this.addedTechniques);
                            let relCopy = Object.assign({}, technique.relationship);
                            relCopy.attributes.name = technique.technique.name;
                            if (technique.technique.extRefs !== undefined) {
                                for (let i in tech[0].extRefs) {
                                    if (tech[0].extRefs[i].external_id !== undefined) {
                                        relCopy.attributes.name = tech[0].extRefs[i].external_id;
                                    }
                                }
                            }
                            this.allRels.push(relCopy);
                            this.currTechniques[i] = this.techniques;
                            i += 1;
                        });
                   }, (error) => {
                     // handle errors here
                     console.log('error ' + error);
                        }, () => {
                            // prevent memory links
                            if (subscription2) {
                                subscription.unsubscribe();
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

    public addTechnique(): void {
        let currTechnique = {};
        currTechnique['name'] = '';
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

    public assignCoaCitations(): void {
        for (let i in this.courseOfAction.attributes.external_references) {
            this.courseOfAction.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.courseOfAction.attributes.external_references[i].citation = '(Citation: ' + this.courseOfAction.attributes.external_references[i].source_name + ')';
            this.courseOfAction.attributes.external_references[i].citeref = '[[CiteRef::' + this.courseOfAction.attributes.external_references[i].source_name + ']]';
        }
    }

    public saveRelationships(): void {
        for (let technique of this.addedTechniques) {
            let found = this.origRels.find((h) => h.id === technique.relationship);
            let ref = this.techniques.find((h) => h.name === technique.name);   
            if (found === undefined) {
                let rel = new Relationship();      
                rel.attributes.source_ref = this.attackPattern.id;
                rel.attributes.target_ref = ref.id;
                rel.attributes.relationship_type = 'related-to';
                this.stixService.url = Constance.RELATIONSHIPS_URL;
                console.log(rel);
                let subscription = super.create(rel).subscribe(
                    (data) => {
                        console.log(data);
                        rel.attributes.target_ref = this.attackPattern.id;
                        rel.attributes.source_ref = ref.id;
                        this.stixService.url = Constance.RELATIONSHIPS_URL;
                        let sub = super.create(rel).subscribe(
                            (data) => {
                                console.log(data);
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
                this.origRels = this.origRels.filter((h) => h.source_ref !== ref.id);
                this.origRels = this.origRels.filter((h) => h.target_ref !== ref.id);
            }
        }
        for (let rel of this.origRels) {
            rel.url = Constance.RELATIONSHIPS_URL;
            rel.id = rel.attributes.id;
            this.delete(rel).subscribe(
                () => {
                }
            );
        }
    }
    
    public saveAttackPattern(): void {
        this.removeEmpties();
        if (this.mitreId === '' || this.mitreId === undefined ) {
            if (this.addId) {
                this.mitreId = new ExternalReference();
                this.mitreId.external_id = this.id;
                this.mitreId.source_name = 'mitre-pre-attack';
                this.mitreId.url = 'https://attack.mitre.org/techniques/' + this.id
            } else {
                this.mitreId = new ExternalReference();
                this.mitreId.source_name = 'mitre-pre-attack';
            }
        } else {
            this.mitreId.external_id = this.id;
            this.mitreId.url = 'https://attack.mitre.org/techniques/' + this.id
        }
        this.addExtRefs();
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
        for (let i in this.attackPattern.attributes.kill_chain_phases) {
            this.attackPattern.attributes.kill_chain_phases[i].kill_chain_name = 'mitre-pre-attack';
        }
        let sub = super.saveButtonClicked().subscribe(
            (data) => {
                console.log(data);
                this.saveCoursesOfAction(data.id, this.allCitations);
                this.saveRelationships();
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
