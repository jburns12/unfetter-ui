import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Constance } from '../../../utils/constance';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { AttackPattern } from '../../../models';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';
import { FormatHelpers } from '../../../global/static/format-helpers';

@Component({
  selector: 'tactics',
  templateUrl: './tactics-home.component.html',
  providers: [ StixService ],
  styleUrls: ['./tactics-home.component.scss']
})

export class TacticsHomeComponent extends BaseStixComponent implements OnInit {
    public attackPatterns: AttackPattern[] = [];
    public tactics: any = [];
    public tactic: any;
    public domainMap: any = {'pre': 'mitre-pre-attack', 'enterprise': 'mitre-attack', 'mobile': 'mitre-mobile-attack'};

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
        this.stixService.url = Constance.ATTACK_PATTERN_URL;
    }

    public ngOnInit() {
        this.getTactics();
    }

    public formatText(inputString): string {
        return FormatHelpers.formatAll(inputString);
    }

    public getTactics(): void {
        let uri = Constance.CONFIG_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (res) => {
              if (res && res.length) {
                  for (let currRes of res) {
                      if (currRes.attributes.configKey === 'tactics') {
                          for (let currTactic of currRes.attributes.configValue.enterprise_tactics.tactics) {
                              this.tactics.push({"tactic": currTactic.tactic, "description": currTactic.description});
                          }
                          for (let currTactic of currRes.attributes.configValue.pre_attack_tactics.tactics) {
                              this.tactics.push({"tactic": currTactic.tactic, "description": currTactic.description});
                          }
                          for (let currTactic of currRes.attributes.configValue.mobile_tactics.tactics) {
                              this.tactics.push({"tactic": currTactic.tactic, "description": currTactic.description});
                          }
                      }
                  }
              }
              console.log(this.route.params);
              this.route.params.map(params => params['tactic']).
              subscribe((tactic) => {
                this.route.params.map(params => params['domain']).
                subscribe((domain) => {
                    this.tactic = this.tactics.find((h) => (h.tactic === tactic));
                    console.log(tactic);
                    console.log(this.tactic);
                    const filterObj = { 'stix.kill_chain_phases.phase_name': tactic, 'stix.kill_chain_phases.kill_chain_name': this.domainMap[domain] };
                    const filter = `filter=${JSON.stringify(filterObj)}`;
                    console.log(filter);
                    const subscription = super.load(filter).subscribe(
                        (data) => {
                            this.attackPatterns = data as AttackPattern[];
                            console.log(this.attackPatterns);
                            
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
            )
              }
          )
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
