import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { SuperTabsModule } from 'ionic2-super-tabs';

// Pages
import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';
import { EstabelecimentosModule } from '../pages/estabelecimentos/estabelecimentos.module';
import { EstabelecimentoDetailsModule } from '../pages/estabelecimento-details/estabelecimento-details.module';
import { CheckinModule } from '../pages/checkin/checkin.module';
import { MapaModule } from '../pages/mapa/mapa.module';

// Import the AF2 Modules
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

//Services
import { DataService } from '../services/data-service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpModule} from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

//utils
import { Utils } from '../classes/utils';

// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyCcAlOaliIlgSVnz-KoUkZOG9xbRybpqX4",
  authDomain: "cardappio-60ff4.firebaseapp.com",
  databaseURL: "https://cardappio-60ff4.firebaseio.com",
  storageBucket: "cardappio-60ff4.appspot.com",
  messagingSenderId: "586001503807"
};

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    MapaModule,
    EstabelecimentosModule,
    EstabelecimentoDetailsModule,
    CheckinModule,
    SuperTabsModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    BarcodeScanner,
    DataService,
    Geolocation,
    Utils,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
