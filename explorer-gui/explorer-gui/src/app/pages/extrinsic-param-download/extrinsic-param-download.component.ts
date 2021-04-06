import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AppConfigService} from '../../services/app-config.service';
import {Location} from '@angular/common';
import {Subscription} from "rxjs";


@Component({
  selector: 'app-extrinsic-param-download',
  templateUrl: './extrinsic-param-download.component.html',
  styleUrls: ['./extrinsic-param-download.component.scss']
})
export class ExtrinsicParamDownloadComponent implements OnInit, OnDestroy {

  private networkSubscription: Subscription;
  private fragmentSubsription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appConfigService: AppConfigService,
    private location: Location
  ) { }

  ngOnInit() {
    this.networkSubscription = this.appConfigService.getCurrentNetwork().subscribe( network => {
      this.fragmentSubsription = this.route.paramMap.subscribe(
        (params: ParamMap) => {
          if (params.get('extrinsicId') && params.get('hash')) {
            window.open(
              network.attributes.api_url_root + '/extrinsic-param/download/' + params.get('extrinsicId') + '/' +
              params.get('hash')
            );
            this.location.back();
          }
      });
    });
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.networkSubscription.unsubscribe();
    this.fragmentSubsription.unsubscribe();
  }
}
