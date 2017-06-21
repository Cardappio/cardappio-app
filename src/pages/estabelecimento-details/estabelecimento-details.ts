import { Component, ViewChild, ElementRef  } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';

import { PopoverPage } from './popover';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Cardapio } from '../../classes/cardapio';
import { CategoriaCardapio } from '../../classes/categoriacardapio';
import { Produto } from '../../classes/produto';
import { Utils } from '../../classes/utils';

import { ProdutoDetailsPage } from '../produto-details/produto-details';

import { DataService } from '../../services/data-service';


@Component({
  selector: 'page-estabelecimento-details',
  templateUrl: 'estabelecimento-details.html',
})
export class EstabelecimentoDetails {

   mesaescolhida: Mesa;
   estabelecimento: Estabelecimento;
   estabKey: string;
   redeKey: string;
   mesaKey: string;
   produtosArray: Array<any>;
   

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController, 
    private db: DataService, 
    private utils: Utils) {
      this.estabKey = navParams.get('estabKey');
      this.mesaKey = navParams.get('mesaKey');
      this.redeKey = navParams.get('redeKey');
      this.produtosArray = new Array;
      this.estabelecimento = new Estabelecimento();
      this.mesaescolhida = new Mesa();
  }

  ngOnInit() {
    this.db.getEstabelecimento(this.redeKey, this.estabKey).subscribe( estab => {
      this.estabelecimento.key = estab.key;
      this.estabelecimento.nome = estab.val().nome;
      this.estabelecimento.telefone = estab.val().telefone;
      this.estabelecimento.imgURL = estab.val().imgURL;
    });
  }

  ionViewDidLoad(){ // espera carregar a view
    this.iniciarCardapios(); 
    this.mostraStatusMesa();
  }

  mostraStatusMesa() {
    if(this.mesaKey){ // mostra o popupa apenas se tiver o key da mesa, ou seja, se vier da página de check-in
      this.db.getMesa(this.estabKey, this.mesaKey).subscribe( mesa => {
          this.utils.mergeObj(mesa, this.mesaescolhida); // registrando os dados da mesa para a variaver a ser impressa
      });

      let popover = this.popoverCtrl.create(PopoverPage, {
        mesa: this.mesaescolhida,
        estab: this.estabelecimento
      });

      popover.present({
        //ev: ev
      });
    }
  }

  mostraProduto(produto: Produto){
    this.navCtrl.push(ProdutoDetailsPage, {estabKey: this.estabKey, catKey: produto.categoria, prodKey: produto.key});
  }

  iniciarCardapios(){
   
    this.db.getCardapios(this.estabKey).subscribe( cardapios => { // pega lista de cardapios
      cardapios.forEach(cardapio => {  // loop na lista de cardapios
        
        this.db.getCardapio(this.estabKey, cardapio.key).subscribe( tipoCardapio => { // pega lista de tipos de cardapios
          let cardapioTmp = new Cardapio(); // inicia um objeto cardapio local
          this.db.getCategoriaCardapio(cardapio.key).subscribe( cat_card => { // pega os dados da categoria do cardapio
              this.utils.mergeObj(cat_card, cardapioTmp.categoria); // armazena os dados no objeto local
          });
          tipoCardapio.forEach(dadosCardapio => { // loop nos produtos do cardapio
            let produtoTmp = new Produto(); // inicia objeto produto local
            produtoTmp.key = dadosCardapio.key;
            produtoTmp.categoria = cardapio.key;
            this.utils.mergeObj(dadosCardapio.val(), produtoTmp); // armazena os dados no objeto local
            cardapioTmp.produtos.push(produtoTmp); // adiciona ao array de produtos do objeto cardapio
            this.produtosArray.push(dadosCardapio);
          });
          this.estabelecimento.cardapios.push(cardapioTmp);    // adiciona o cardapio no array de cardapios do estabelecimento (local)        
        });
      });
    });
  }
 
}
