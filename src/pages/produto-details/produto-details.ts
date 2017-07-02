import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Produto } from '../../classes/produto';

import { DataService } from '../../services/data-service';
import { CheckinService } from '../../services/checkin-service';
import { ItemPedido } from '../../classes/itempedido';

@Component({
  selector: 'page-produto-details',
  templateUrl: 'produto-details.html',
})
export class ProdutoDetailsPage {

  estabelecimentoKey: string;
  categoriaKey: string;
  produtoKey: string;
  produto: Produto;
  quantidade: number = 1;
  observacao: string = "nenhuma";
  quantidadeMaxima: number = 5; // ideal que hava uma quantidade de estoque no banco de dados
  itensMaximo: number = 3; // vamos limitar por enquanto a quantidade de itens em cada pedido

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, public navParams: NavParams, private db: DataService, private checkinservice: CheckinService) {
    this.estabelecimentoKey = navParams.get('estabKey');
    this.categoriaKey = navParams.get('catKey');
    this.produtoKey = navParams.get('prodKey');
    this.produto = new Produto();
  }
 
  ngOnInit() {
    this.db.getProduto(this.estabelecimentoKey, this.categoriaKey, this.produtoKey).subscribe( prod => {
      this.produto.key = prod.key;
      this.produto.nome = prod.nome;
      this.produto.descricao = prod.descricao;
      this.produto.preco = prod.preco;
      this.produto.imagemUrl = prod.imagemUrl;
      this.produto.status = prod.status;
    });
    this.db.getCategoriaCardapio(this.categoriaKey).subscribe(cat => {
      this.produto.categoria = cat.nome;
    });
  }

  ionViewDidLoad() {
    
  }
  addProduto(produto: Produto){
    let pedido;
    this.checkinservice.getPedido().subscribe(_pedido => {
      pedido = _pedido;
    });
    if(pedido.itens.length >= this.itensMaximo){
      this.showAlertMaximoItens();
    }else if(produto.status == "esgotado"){
      this.showAlertEsgotado();
    }else{
      let itempedido = new ItemPedido();
      let novo : boolean = true;
      itempedido.produto = produto;
      itempedido.observacao = this.observacao;
      itempedido.quantidade = this.quantidade;
      for(let item of pedido.itens){
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
        pedido.itens.push(itempedido);
      }
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
