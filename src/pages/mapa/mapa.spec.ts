import {} from 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MapaPage } from './mapa';
import { IonicModule, Platform, NavController} from 'ionic-angular/index';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PlatformMock, StatusBarMock, SplashScreenMock } from '../../mocks';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { HttpModule} from '@angular/http';
import { Utils } from '../../classes/utils';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { DataService } from '../../services/data-service';


// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyCcAlOaliIlgSVnz-KoUkZOG9xbRybpqX4",
  authDomain: "cardappio-60ff4.firebaseapp.com",
  databaseURL: "https://cardappio-60ff4.firebaseio.com",
  storageBucket: "cardappio-60ff4.appspot.com",
  messagingSenderId: "586001503807"
};
describe('Página do Mapa', () => {
  let de: DebugElement;
  let comp: MapaPage;
  let fixture: ComponentFixture<MapaPage>;
  
  beforeEach(async(() => {
    
    TestBed.configureTestingModule({
      declarations: [MapaPage],
      imports: [
        HttpModule,
        IonicModule.forRoot(MapaPage),
        AngularFireModule.initializeApp(firebaseConfig),
      ],
      providers: [
        NavController,
        HttpModule,
        Utils,
        DataService,
        AngularFireDatabase,
        
        { provide: Platform, useClass: PlatformMock},
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Geolocation, useClass: Geolocation },
        { provide: Network, useClass: Network },
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaPage);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('ion-title'));
  });
  
  it('componete deve existir', () => expect(comp).toBeDefined());

  it('Deve conter a palavra "Mapa" no titulo', () => {
        fixture.detectChanges();
        const tit = de.nativeElement;
        expect(tit.innerText).toContain('Mapa');
  });

  it('Quando nao encontrar posicao GPS, mostrar mensagem popup', () => {
        comp.getPosition();
        fixture.detectChanges();
        spyOn(comp, 'showAlertPosition').and.callThrough();
        expect(comp.showAlertPosition()).toHaveBeenCalled();
  });
  it('Quando encontrar posicao GPS, registrar lat e lng', () => {
        comp.getPosition();
        fixture.detectChanges();
        expect(comp.getLatUsuario()).toBeGreaterThan(0);
  });
  
});