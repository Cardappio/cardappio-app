import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Produto } from '../../classes/produto';

import { DataService } from '../../services/data-service';

@Component({
  selector: 'page-produto-details',
  templateUrl: 'produto-details.html',
})
export class ProdutoDetailsPage {

  estabelecimentoKey: string;
  categoriaKey: string;
  produtoKey: string;
  produto: Produto;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: DataService) {
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

}
