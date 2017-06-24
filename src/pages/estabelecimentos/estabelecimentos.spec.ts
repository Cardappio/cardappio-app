import {} from 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, Platform, NavController} from 'ionic-angular/index';
import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { EstabelecimentosPage } from './estabelecimentos';
import { Geolocation } from '@ionic-native/geolocation';
import { DataService } from '../../services/data-service';
import { EstabelecimentoDetails } from '../estabelecimento-details/estabelecimento-details';
import { Rede } from '../../classes/Rede';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Network } from '@ionic-native/network';
import { HttpModule} from '@angular/http';
import { Utils } from '../../classes/utils';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';


// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyCcAlOaliIlgSVnz-KoUkZOG9xbRybpqX4",
  authDomain: "cardappio-60ff4.firebaseapp.com",
  databaseURL: "https://cardappio-60ff4.firebaseio.com",
  storageBucket: "cardappio-60ff4.appspot.com",
  messagingSenderId: "586001503807"
};

describe('Página de Estabelecimentos', () => {
  let de: DebugElement;
  let comp: EstabelecimentosPage;
  let fixture: ComponentFixture<EstabelecimentosPage>;
  
  beforeEach(async(() => {
    
    TestBed.configureTestingModule({
      declarations: [EstabelecimentosPage],
      imports: [
        HttpModule,
        IonicModule.forRoot(EstabelecimentosPage),
        AngularFireModule.initializeApp(firebaseConfig),
      ],
      providers: [
        NavController,
        HttpModule,
        Utils,
        DataService,
        AngularFireDatabase,
        { provide: Geolocation, useClass: Geolocation },
        { provide: Network, useClass: Network },
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstabelecimentosPage);
    comp = fixture.componentInstance;
  });
  
  it('Componente da página deve existir', () => expect(comp).toBeDefined());
  it('Deve conter a palavra "Estabelecimentos" no titulo', () => {
        comp.toggled = false;
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('ion-title'));
        const tit = de.nativeElement;
        expect(tit.innerText).toContain('Estabelecimentos');
  });
  it('Caixa de pesquisa deve ser mostrada ao clicar na lupa', () => {
        comp.toggled = true;
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('ion-searchbar'));
        const search = de.nativeElement;
        expect(search.innerText).toContain('');
  });
  it('Busca deve retornar ao menos um estabelecimento quando existir', () => {
        comp.toggled = true; // para mostrar a caixa de busca
        de = fixture.debugElement.query(By.css('ion-list'));
        console.log("Nodes na lista antes: " + de.childNodes.length);
        fixture.detectChanges();    // atualiza
        expect(de.childNodes.length).toBeGreaterThan(0);
  });
  
});

