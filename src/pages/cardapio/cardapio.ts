import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Estabelecimento } from '../../classes/estabelecimento';
import { Cardapio } from '../../classes/cardapio';
import { Produto } from '../../classes/produto';
import { ItemPedido } from '../../classes/itempedido';

import { Utils } from '../../classes/utils';

import { ProdutoDetailsPage } from '../produto-details/produto-details';

import { DataService } from '../../services/data-service';
import { CheckinService } from '../../services/checkin-service';

@Component({
  selector: 'page-cardapio',
  templateUrl: 'cardapio.html',
})
export class CardapioPage {

  estabelecimento: Estabelecimento;
  cardapio: Cardapio;
  observacao: string = "nenhuma";
  quantidade: number = 1;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: DataService,
              private utils: Utils, private checkinService: CheckinService) {
    this.estabelecimento = navParams.get('estabelecimento');
    
    this.cardapio = new Cardapio();
  }

  ionViewDidLoad() {
    this.mostrarCardapio(); 
  }

  mostrarCardapio(){
   
    this.db.getCardapio(this.estabelecimento.key).subscribe( categorias => { // pega lista de categorias
      categorias.forEach(categoria => {  // loop na lista de categorias
        
        this.db.getItensCardapio(this.estabelecimento.key, categoria.key).subscribe( itens => { // pega lista de itens no cardápio
          // this.db.getCategoriaCardapio(categoria.key).subscribe( cat_card => { // pega os dados da categoria do cardapio
          //     this.utils.mergeObj(cat_card, cardapioTmp.categoria); // armazena os dados no objeto local
          // });
          itens.forEach(item => { // loop nos itens do cardapio
            let produtoTmp = new Produto(); // inicia objeto produto local
            produtoTmp.key = item.key;
            produtoTmp.categoria = categoria.key;
            this.utils.mergeObj(item.val(), produtoTmp); // armazena os dados no objeto local
            this.cardapio.produtos.push(produtoTmp); // adiciona ao array de produtos do objeto cardapio
          });
        });
      });
    });

  }

  addProduto(produto: Produto){
    let itempedido = new ItemPedido();
    itempedido.produto = produto;
    itempedido.observacao = this.observacao;
    itempedido.quantidade = this.quantidade;
    this.checkinService.addItemPedido(itempedido);
  }
  
  mostrarProduto(produto: Produto) {
    this.navCtrl.push(ProdutoDetailsPage, {estabKey: this.estabelecimento.key, catKey: produto.categoria, prodKey: produto.key});
  }

}
