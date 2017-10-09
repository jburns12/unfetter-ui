import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BaseStixComponent } from '../../../base-stix.component';
import { StixService } from '../../../stix.service';
import { AttackPattern, IntrusionSet, Relationship, ExternalReference, Malware, Tool } from '../../../../models';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
    selector: 'intrusion-set',
    templateUrl: './intrusion-set.component.html'
})
export class IntrusionSetComponent extends BaseStixComponent implements OnInit {
    public intrusionSet: IntrusionSet = new IntrusionSet();
    public aliases: any = [];
    public addedTechniques: any = [];
    public techniques: any = [];
    public addedSoftwares: any = [];
    public softwares: any = [];
    public editComponent: boolean = false;
    public origRels: any = [];

     constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location,
        public snackBar: MdSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        stixService.url = Constance.INTRUSION_SET_URL;
    }

    public ngOnInit() {
        this.loadIntrusionSet();
    }

    public editButtonClicked(): void {
        const link = ['../edit', this.intrusionSet.id];
        super.gotoView(link);
    }

    public deleteButtonClicked(): void {
        super.openDialog(this.intrusionSet).subscribe(
            () => {
                this.location.back();
                this.deleteRels(this.intrusionSet.id);
            }
        );
    }

    public saveButtonClicked(): Observable<any> {
        return Observable.create((observer) => {
               const subscription = super.save(this.intrusionSet).subscribe(
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

    public getAllAliases(): void{
        this.intrusionSet.attributes.aliases.shift();
        for(let alias of this.intrusionSet.attributes.aliases){
            let description = '';
            let extRef = this.intrusionSet.attributes.external_references.filter(((h) => h.source_name === alias));
            if(extRef.length > 0){
                this.intrusionSet.attributes.external_references = this.intrusionSet.attributes.external_references.filter(((h) => h.source_name !== alias));
                description = extRef[0].description;
            }
            this.aliases.push({'name': alias, 'description': description});
            this.intrusionSet.attributes.aliases = [];
        }
    }

    public findRelationships(technique: boolean): void{
        let filter = { 'stix.source_ref': this.intrusionSet.id };
        let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let target = data as Relationship[];
                target.forEach((relationship: Relationship) => {
                    if(relationship.attributes.relationship_type == "uses"){
                        if(technique){
                            this.getTechniqueRels(relationship);
                        }
                        else{
                            this.getSwRels(relationship);
                        }
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

    public getTechniqueRels(relationship: Relationship): void{
        let tech = this.techniques.filter((h) => h.id === relationship.attributes.target_ref);
        if(tech.length > 0){
            this.origRels.push(relationship);
            this.addedTechniques.push({'name': tech[0].name, 'description': relationship.attributes.description, 'relationship': relationship.id})
        }
    }

    public getSwRels(relationship: Relationship): void{
        let sw = this.softwares.filter((h) => h.id === relationship.attributes.target_ref);
        if(sw.length > 0){
            this.origRels.push(relationship);
            this.addedSoftwares.push({'name': sw[0].name, 'description': relationship.attributes.description, 'relationship': relationship.id})
        }
    }

    public getTechniques(create: boolean): void{
        let subscription =  super.getByUrl(Constance.ATTACK_PATTERN_URL).subscribe(
            (data) => {
                let target = data as AttackPattern[];
                target.forEach((attackPattern: AttackPattern) => {
                    this.techniques.push({'name': attackPattern.attributes.name, 'id': attackPattern.id});
                });
                this.techniques = this.techniques.sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
                if(!create){
                    this.findRelationships(true);
                }
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

    public getSoftware(create: boolean): void {
        let subscription =  super.getByUrl(Constance.MALWARE_URL).subscribe(
            (data) => {
                let target = data as Malware[];
                target.forEach((malware: Malware) => {
                    this.softwares.push({'name': malware.attributes.name, 'id': malware.id});
                });
                this.getTools(create);
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

    public getTools(create: boolean): void {
        let subscription =  super.getByUrl(Constance.TOOL_URL).subscribe(
            (data) => {
                let target = data as Tool[];
                target.forEach((tool: Tool) => {
                    this.softwares.push({'name': tool.attributes.name, 'id': tool.id});
                });
                this.softwares = this.softwares.sort((a,b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
                if(!create){
                    this.findRelationships(false);
                }
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

    public loadIntrusionSet(): void {
        const subscription =  super.get().subscribe(
            (data) => {
                this.intrusionSet = new IntrusionSet(data);
                this.getTechniques(false);
                this.getSoftware(false);
                if(this.editComponent){
                    this.getAllAliases();
                }
                super.getCitations();
                //let filter = 'filter=' + encodeURIComponent(JSON.stringify({ target_ref: this.intrusionSet.id }));
                // this.loadRelationships(filter);

                //filter = 'filter=' + encodeURIComponent(JSON.stringify({ source_ref: this.intrusionSet.id }));
                // this.loadRelationships(filter);
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

    public cleanWhitespace(inputString): string {
        return FormatHelpers.mitreCitationsToHtml(FormatHelpers.whitespaceToBreak(inputString));
    }
}
