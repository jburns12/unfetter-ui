import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constance } from '../../utils/constance';
import { SortHelper } from '../sort-helper';
import { AssessmentsCalculationService } from '../assessments-calculation.service';

@Component({
    selector: 'techniques-chart',
    templateUrl: './techniques-chart.component.html',
    styleUrls: ['./techniques-chart.component.css']
})
export class TechniquesChartComponent implements OnInit {
    @Input()
    public techniqueBreakdown: SophisticationKeys;

    @Input()
    public showLabels: boolean;
    public readonly showLabelsDefault = true;

    @Input()
    public showLegand: boolean;
    public readonly showLegandDefault = true;

    @Input()
    public riskThreshold: number;
    public readonly riskThresholdDefault = 0.0;

    @Input()
    public riskLabelOptions;

    public readonly barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true,
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true
            }]
        }
    };
    public barChartLabels: string[] = [];
    public readonly barChartType: string = 'bar';
    public barChartData: any[] = [
        { data: [], label: '' },
        { data: [], label: '' }
    ];

    // tslint:disable-next-line:no-empty
    public constructor(private assessmentsCalculationService: AssessmentsCalculationService) {}

    /**
     * @description
     *  initialize this class memebers, calls render when finished
     */
    public ngOnInit(): void {
        this.showLabels = this.showLabels || this.showLabelsDefault;
        this.showLegand = this.showLegand || this.showLegandDefault;
        this.riskThreshold = this.riskThreshold || this.riskThresholdDefault;
        this.renderChart();
    }

    /**
     * @description
     *  renders the chart components, based on applied threshold
     */
    public renderChart(): void {
        console.log('render chart, techniques breakdown', this.techniqueBreakdown);
        this.renderLabels();
        this.renderLegend();
        this.initDataArray();

        const breakdown = Object.keys(this.techniqueBreakdown);
        let index = 0;
        breakdown.forEach((key) => {
            this.barChartData[0].data[index] = this.techniqueBreakdown[key];
            this.barChartData[1].data[index] = 1.0  - this.techniqueBreakdown[key];
            index = index + 1;
        });
    }

    public renderLabels(): void {
        this.barChartLabels = Object.keys(this.techniqueBreakdown)
            .map((level) => this.assessmentsCalculationService.sophisicationNumberToWord(level));
    }

    public renderLegend(): void {
        if (this.riskLabelOptions) {
            const option = this.riskLabelOptions.find((opt) => opt.risk === this.riskThreshold);
            const name = option.name;
            this.barChartData[0].label = 'Below ' + name;
            this.barChartData[1].label = 'At Or Above ' + name;
        }
    }

    // events
    public chartClicked(e: any): void {
        console.log(e);
    }

    public chartHovered(e: any): void {
        console.log(e);
    }

    protected initDataArray(): void {
        const size = this.barChartLabels.length || 0;
        // init data array
        this.barChartData[0].data = [];
        this.barChartData[1].data = [];
        for (let i = 0; i < size; i++) {
            this.barChartData[0].data[i] = 0;
            this.barChartData[1].data[i] = 0;
        }
    }

}

interface SophisticationKeys {
    0: number; 1: number; 2: number; 3: number;
};