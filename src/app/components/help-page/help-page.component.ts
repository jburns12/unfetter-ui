import { Component, ViewEncapsulation, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'help-page',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./help-page.component.scss'],
    templateUrl: './help-page.component.html'
})
export class HelpPageComponent implements OnInit {
    @Output() closeEvent = new EventEmitter<boolean>();
    constructor() {}
    public ngOnInit() {}
    public close() { console.log("emit"); this.closeEvent.emit(); }
}
  
  