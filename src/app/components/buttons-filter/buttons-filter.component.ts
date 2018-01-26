import { Component, Input, Output, OnChanges, OnInit, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'buttons-filter',
  templateUrl: './buttons-filter.component.html'
})

export class ButtonsFilterComponent implements OnChanges {
    @Input() public model: any[];
    @Input() public filteredItems: any[];
    @Input() public showGrid = false;
    @Input() public draftsOnly: boolean;
    @Output() public filterItemsChange = new EventEmitter<any[]>();

    public ngOnChanges() {

    }

    public onFilterItemsChange(filterItems: any[]): void {
        this.filterItemsChange.emit(filterItems);
    }

    public download(): void {
        alert('not implemented');
    }
}
