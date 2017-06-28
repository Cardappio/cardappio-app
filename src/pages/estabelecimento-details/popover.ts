import { Component, ViewChild, ElementRef  } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { CheckinService } from '../../services/checkin-service';

@Component({
  templateUrl: 'popover.html',
})
export class PopoverPage {
  @ViewChild('popoverContent2', { read: ElementRef }) content: ElementRef;
  constructor(private navParams: NavParams,  private checkinService: CheckinService) {
  }

  ngOnInit() {
    
  }
  /* Apenas para debug, mover para área administrativa depois */
  aprovarCheckin(){
    this.checkinService.aprovaCheckin();
  }

}
