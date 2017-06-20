import { Component, ViewChild, ElementRef  } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';

@Component({
  templateUrl: 'popover.html',
  
})
export class PopoverPage {
  @ViewChild('popoverContent2', { read: ElementRef }) content: ElementRef;
   
  mesa: object;
  estab: object;
  
  constructor(private navParams: NavParams) {
  }

  ngOnInit() {
    if (this.navParams.data) {
      this.mesa = this.navParams.data.mesa;
      this.estab = this.navParams.data.estab;
      console.log(this.mesa);
      console.log(this.estab
      );
    }
  }

}
