/*
 * Polkascan Explorer GUI
 *
 * Copyright 2018-2020 openAware BV (NL).
 * This file is part of Polkascan.
 *
 * Polkascan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Polkascan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Polkascan. If not, see <http://www.gnu.org/licenses/>.
 *
 * chart.component.ts
 */

import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {AnalyticsChart} from '../../classes/analytics-chart.class';
import {Observable, Subscription} from 'rxjs';
import {AppConfigService} from '../../services/app-config.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input() analyticsChart: Observable<AnalyticsChart>;
  @Input() chartData: AnalyticsChart;
  @Input() chartId: string;
  @Input() title = '';
  @Input() yAxisTitle: string;
  @Input() xAxisType = 'lineair';
  @Input() themeColor = '#7cb5ec';
  @Input() height: string = null;

  private networkSubscription: Subscription;

  chart: Chart;


  constructor(private ref: ChangeDetectorRef, private appConfigService: AppConfigService) { }

  public renderChart(chartData) {
    const options = {
      colors: [this.themeColor],
      chart: {
        type: 'area',
        zoomType: 'x',
        height: this.height
      },
      title: {
        text: this.title,
        style: {fontSize: '12px'}
      },
      credits: {
        enabled: false
      },
      xAxis: {},
      yAxis: {
        title: {
          text: this.yAxisTitle
        },
        min: 0
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, this.themeColor],
              [1, '#fff']
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },
      series: []
    };

    if (this.xAxisType === 'datetime') {
              options.xAxis = {
                type: 'datetime',
                minRange: 14 * 24 * 3600000
              };
            }

    if (this.xAxisType === 'category') {
              options.xAxis = {
                type: 'category'
              };
            }

            // @ts-ignore
    this.chart = new Chart(options);

            // tslint:disable-next-line:no-string-literal
    this.chart.addSeries(chartData.attributes.data['series'][0], true, true);
  }

  ngOnInit() {

        if (this.chartData) {
          this.renderChart(this.chartData);
        }

        if (this.analyticsChart) {

          this.analyticsChart.subscribe(chart => {

            if (!chart.is_loading) {
              this.renderChart(chart);
            }
          });
        }
  }

}
