import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Cardapio } from '../../classes/cardapio';
import { CategoriaCardapio } from '../../classes/categoriacardapio';
import { Produto } from '../../classes/produto';
import { Utils } from '../../classes/utils';


@Component({
  selector: 'page-estabelecimento-details',
  templateUrl: 'estabelecimento-details.html',
})
export class EstabelecimentoDetails {

   mesaescolhida: Mesa;
   estabelecimento: Estabelecimento;
   estabKey: string;
   redeKey: string;
   produtosArray: Array<any>;
   mesaKey: string;
   

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, private utils: Utils) {
    this.estabKey = navParams.get('estabKey');
    this.mesaKey = navParams.get('mesaKey');
    this.redeKey = navParams.get('redeKey');
    this.produtosArray = new Array;
    this.estabelecimento = new Estabelecimento();
    this.mesaescolhida = new Mesa();
    
  }
  ionViewDidLoad(){ // espera carregar a view
    this.iniciarCadapios(); 
  }
  iniciarCadapios(){
    this.db.object('/mesas/'+this.estabKey+'/'+this.mesaKey).subscribe( mesa => {
          this.utils.mergeObj(mesa, this.mesaescolhida);
    });
   
    this.db.object('/estabelecimentos/'+this.redeKey+'/'+this.estabKey).subscribe( estab => {
        this.utils.mergeObj(estab, this.estabelecimento);
    });
   
    this.getDB('/cardapios/'+this.estabKey).subscribe( snapshot => { // pega lista de cardapios
      snapshot.forEach(cardapio => {  // loop na lista de cardapios
        
        this.getDB('/cardapios/'+this.estabKey+'/'+cardapio.key).subscribe( tipoCardapio => { // pega lista de tipos de cardapios
          let cardapioTmp = new Cardapio(); // inicia um objeto cardapio local
          this.db.object('/categorias_cardapio/'+cardapio.key).subscribe( cat_card => { // pega os dados da categoria do cardapio
              this.utils.mergeObj(cat_card, cardapioTmp.categoria); // armazena os dados no objeto local
          });
          tipoCardapio.forEach(dadosCardapio => { // loop nos produtos do cardapio
            let produtoTmp = new Produto(); // inicia objeto produto local
            
            this.utils.mergeObj(dadosCardapio.val(), produtoTmp); // armazena os dados no objeto local
            cardapioTmp.produtos.push(produtoTmp); // adiciona ao array de produtos do objeto cardapio
            this.produtosArray.push(dadosCardapio);
          });
          this.estabelecimento.cardapios.push(cardapioTmp);    // adiciona o cardapio no array de cardapios do estabelecimento (local)        
        });
      });
    });
  }

  getDB(url: string): FirebaseListObservable<any>{
    return this.db.list(url, {preserveSnapshot: true});
  }
 

}
