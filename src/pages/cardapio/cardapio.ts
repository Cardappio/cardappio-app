import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

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
  quantidadeMaxima: number = 5; // ideal que hava uma quantidade de estoque no banco de dados
  itensMaximo: number = 3; // vamos limitar por enquanto a quantidade de itens em cada pedido

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, public navParams: NavParams, private db: DataService,
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
    if(this.checkinService.getPedido().itens.length >= this.itensMaximo){
      this.showAlertMaximoItens();
    }else if(produto.status == "esgotado"){
      this.showAlertEsgotado();
    }else{
      let itempedido = new ItemPedido();
      let novo : boolean = true;
      itempedido.produto = produto;
      itempedido.observacao = this.observacao;
      itempedido.quantidade = this.quantidade;
      for(let item of this.checkinService.getPedido().itens){
        if((item.produto.key == itempedido.produto.key) && 
          (item.observacao == itempedido.observacao)){
          if((+item.quantidade + +itempedido.quantidade) > this.quantidadeMaxima){
            this.alertQuantidadeMax();
            novo = false;
          }else{
            item.quantidade += itempedido.quantidade; // se for o mesmo produto/obs, apenas incrementa quantidade
            novo = false;
          }
        }
      }
      if(novo){
        this.checkinService.getPedido().itens.push(itempedido);
      }
      this.quantidade = 1;
    }
  }
  finalizaPedido(){
    this.checkinService.gravaPedido();
    console.log("Id estab depois de finalizado: " + this.checkinService.getEstabelecimento().key);
    this.navCtrl.pop(); // volta para pagina anterior
    this.navCtrl.pop(); // volta para pagina anterior à anterior
  }
  removeitem(item: ItemPedido){
    this.checkinService.getPedido().itens = this.checkinService.getPedido().itens.filter(i => i !== item);
  }
  
  mostrarProduto(produto: Produto) {
    this.navCtrl.push(ProdutoDetailsPage, {estabKey: this.estabelecimento.key, catKey: produto.categoria, prodKey: produto.key});
  }
  alteraQuantidade(qty: number){
    this.quantidade = this.quantidade + qty;
    if(this.quantidade < 1){
      this.quantidade = 1;
    }
  }
  
  showAlertEsgotado() {
    let confirm = this.alertCtrl.create({
        title: 'Produto Esgotado!',
        message: 'Este item não está disponível no momento.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      });
    confirm.present();
  }
  alertQuantidadeMax() {
    let confirm = this.alertCtrl.create({
        title: 'Quantidade maxima',
        message: 'São permitidos pedidos de no máximo ' + this.quantidadeMaxima + ' deste item',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      });
    confirm.present();
  }
  showAlertMaximoItens() {
    let confirm = this.alertCtrl.create({
        title: 'Quantidade maxima de itens',
        message: 'São permitidos no máximo ' + this.quantidadeMaxima + ' itens por pedido',
        buttons: [
          {
            text: 'OK',
            handler: () => {
            }
          }
        ]
      });
    confirm.present();
  }
  

}
