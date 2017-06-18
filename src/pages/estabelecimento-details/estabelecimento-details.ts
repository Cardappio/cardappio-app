import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Mesa } from '../../classes/mesa';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Utils } from '../../classes/utils';


@Component({
  selector: 'page-estabelecimento-details',
  templateUrl: 'estabelecimento-details.html',
})
export class EstabelecimentoDetails {

   mesaescolhida: Mesa;
   estabelecimento: Estabelecimento;
   estabKey: string;
   produtosArray: Array<any>;
   idmesa: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, private utils: Utils) {
    this.estabKey = navParams.get('estabKey');
    this.idmesa = navParams.get('idmesa');
    this.produtosArray = new Array;
    this.estabelecimento = new Estabelecimento();
    this.mesaescolhida = new Mesa();
  }
  ionViewDidLoad(){ // espera carregar a view
    this.iniciarCadapios(); 
  }
  iniciarCadapios(){
    this.db.object('/mesas/'+this.estabKey+'/'+this.idmesa).subscribe( mesa => {
          this.mesaescolhida = mesa;
    });
   
   this.db.object('/estabelecimentos/-Kmb-c0vLJkXbLdaEXmk/'+this.estabKey).subscribe( estab => {
      this.estabelecimento = estab;
      console.log(this.estabelecimento);
    });
    this.getDB('/cardapios/'+this.estabKey).subscribe( snapshot => {
      snapshot.forEach(cardapio => {
        this.getDB('/cardapios/'+this.estabKey+'/'+cardapio.key).subscribe( tipoCardapio => {
          tipoCardapio.forEach(dadosCardapio => {
            this.produtosArray.push(dadosCardapio);
          })
        });
      });
    });
  }

  getDB(url: string): FirebaseListObservable<any>{
    return this.db.list(url, {preserveSnapshot: true});
  }
 

}
