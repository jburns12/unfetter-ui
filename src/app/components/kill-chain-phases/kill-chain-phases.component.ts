import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { KillChainPhase } from '../../models';

@Component({
  selector: 'kill-chain-phases',
  templateUrl: './kill-chain-phases.component.html'
})
export class KillChainPhasesComponent {

    @Input() public model: any;
    private tactics: string[] = ['collection', 'command-and-control', 'credential-access', 'defense-evasion', 'discovery', 'execution', 'exfiltration', 'lateral-movement', 'persistence', 'privilege-escalation'];

    public addkillChainPhase(): void {
        // let id = this.attackPattern.kill_chain_phases.length + 1;
        let killChainPhase = new KillChainPhase();
        killChainPhase.kill_chain_name = 'mitre-attack';
        killChainPhase.phase_name = '';
        this.model.attributes.kill_chain_phases.unshift(killChainPhase);
    }

    public removekillChainPhase(killChainPhase: KillChainPhase): void {
         this.model.attributes.kill_chain_phases = this.model.attributes.kill_chain_phases.filter((h) => h !== killChainPhase);
    }
}
