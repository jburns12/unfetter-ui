import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { AttackPattern, KillChainPhase, Tool, Relationship } from '../../../../models';
import { StixService } from '../../../stix.service';
import { BaseStixComponent } from '../../../base-stix.component';
import { Constance } from '../../../../utils/constance';
import { FormatHelpers } from '../../../../global/static/format-helpers';

@Component({
  selector: 'tool',
  templateUrl: './tool.component.html',

})

export class ToolComponent extends BaseStixComponent implements OnInit {
public tool: Tool = new Tool();
public aliases: any = [];
public addedTechniques: any = [];
public currTechniques: any = [];
public techniques: any = [];
public origRels: any = [];

constructor(
     public stixService: StixService,
     public route: ActivatedRoute,
     public router: Router,
     public dialog: MdDialog,
     public location: Location,
     public snackBar: MdSnackBar) {

     super(stixService, route, router, dialog, location, snackBar);
     stixService.url = Constance.TOOL_URL;
 }

   public ngOnInit() {
     this.loadTool();
   }

   public editButtonClicked(): void {
       let link = ['../edit', this.tool.id];
       super.gotoView(link);
   }

   public deleteButtonClicked(): void {
      super.openDialog(this.tool).subscribe(
         () => {
            let goBack = true;
            this.deleteRels(this.tool.id, goBack);
         }
      );
   }

   public findRelationships(): void {
       let filter = { 'stix.target_ref': this.tool.id };
       let uri = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
       let subscription =  super.getByUrl(uri).subscribe(
           (data) => {
               let target = data as Relationship[];
               let i = 0;
               target.forEach((relationship: Relationship) => {
                   if (relationship.attributes.relationship_type === 'uses') {
                       let tech = this.techniques.filter((h) => h.id === relationship.attributes.source_ref);
                       if (tech.length > 0) {
                           this.addedTechniques.push({'name': tech[0].name, 'description': relationship.attributes.description, 'relationship': relationship.id});
                           this.origRels.push(relationship);
                           this.currTechniques[i] = this.techniques;
                           for (let index in this.currTechniques) {
                               for (let j in this.addedTechniques) {
                                  if (j !== index) {
                                      this.currTechniques[index] = this.currTechniques[index].filter((h) => h.name !== this.addedTechniques[j].name)
                                  }
                               }
                           }
                           i += 1;
                       }
                   }
                 });
              }, () => {
               // prevent memory links
               if (subscription) {
                   subscription.unsubscribe();
               }
           }
       );
   }

   public getTechniques(create: boolean): void {
       let subscription =  super.getByUrl(Constance.ATTACK_PATTERN_URL).subscribe(
           (data) => {
               let target = data as AttackPattern[];
               target.forEach((attackPattern: AttackPattern) => {
                   this.techniques.push({'name': attackPattern.attributes.name, 'id': attackPattern.id});
               });
               this.techniques = this.techniques.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
               if (!create) {
                   this.findRelationships();
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

   public getAllAliases(): void {
       if ('x_mitre_aliases' in this.tool.attributes) {
           this.tool.attributes.x_mitre_aliases.shift();
           for (let alias of this.tool.attributes.x_mitre_aliases) {
               let description = '';
               let extRef = this.tool.attributes.external_references.filter(((h) => h.source_name === alias));
               if (extRef.length > 0) {
                   this.tool.attributes.external_references = this.tool.attributes.external_references.filter(((h) => h.source_name !== alias));
                   description = extRef[0].description;
               }
               this.aliases.push({'name': alias, 'description': description});
               this.tool.attributes.x_mitre_aliases = [];
           }
       }
   }

   public saveButtonClicked(): Observable<any> {
       return Observable.create((observer) => {
              let subscription = super.save(this.tool).subscribe(
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

   public loadTool(): void {
       let sub = super.get().subscribe(
         (data) => {
           this.tool =  new Tool(data);
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

   public formatText(inputString): string {
       return FormatHelpers.formatAll(inputString);
   }

   public visitExtRef(url): void {
       window.open(url, "_blank");
   }
}
