import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Constance } from '../../../utils/constance';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { AttackPattern } from '../../../models';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';

@Component({
  selector: 'tactics',
  templateUrl: './tactics-home.component.html',
  providers: [ StixService ],
  styleUrls: ['./tactics-home.component.scss']
})

export class TacticsHomeComponent extends BaseStixComponent implements OnInit, OnChange {
    public attackPatterns: AttackPattern[] = [];

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
        this.route.params.map(params => params['tactic']).
            subscribe((tactic) => {
                console.log(tactic);
                const filterObj = { 'stix.kill_chain_phases.phase_name': tactic };
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
}
