import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstabelecimentosPage } from './estabelecimentos';

@NgModule({
  declarations: [
    EstabelecimentosPage
  ],
  imports: [
    IonicPageModule.forChild(EstabelecimentosPage)
  ],
  exports: [
    EstabelecimentosPage
  ]
})
export class EstabelecimentosModule {}
