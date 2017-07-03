import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { EstabelecimentosPage } from '../estabelecimentos/estabelecimentos';
import { CheckinPage } from '../checkin/checkin';
import { MapaPage } from '../mapa/mapa';
import { AdminPage } from '../admin/admin';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = EstabelecimentosPage;
  tab2Root = CheckinPage;
  tab3Root = MapaPage;
  tab4Root = AdminPage;
  constructor() {

  }
}
