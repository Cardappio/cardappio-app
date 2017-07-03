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
import { CardapioPage } from '../cardapio/cardapio';

import { DataService } from '../../services/data-service';
import { CheckinService } from '../../services/checkin-service';


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
   dataAtual: Date;
   diasFuncionamentoArray: Array<string>;
   popover: any;
   

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController, 
    private db: DataService,
    private checkinService: CheckinService, 
    private utils: Utils) {
      this.estabKey = navParams.get('estabKey');
      this.mesaKey = navParams.get('mesaKey');
      this.redeKey = navParams.get('redeKey');
      this.produtosArray = new Array;
      this.estabelecimento = new Estabelecimento();
      this.mesaescolhida = new Mesa();
      this.dataAtual = new Date();
      this.diasFuncionamentoArray = [];
  }

  ngOnInit() {
    this.db.getEstabelecimento(this.redeKey, this.estabKey).subscribe( estab => {
      this.estabelecimento.key = estab.key;
      this.estabelecimento.nome = estab.val().nome;
      this.estabelecimento.logradouro = estab.val().logradouro;
      this.estabelecimento.numero = estab.val().numero;
      this.estabelecimento.bairro = estab.val().bairro;
      this.estabelecimento.telefone = estab.val().telefone;
      this.estabelecimento.imgURL = estab.val().imgURL;
      this.estabelecimento.dias_funcionamento = estab.val().dias_funcionamento;
      let hora_abertura = estab.val().horario_abertura;
      this.estabelecimento.horario_abertura.setHours(hora_abertura.split(":")[0], hora_abertura.split(":")[1]);
      let hora_fechamento = estab.val().horario_fechamento;
      this.estabelecimento.horario_fechamento.setHours(hora_fechamento.split(":")[0], hora_fechamento.split(":")[1]);
    });
  }

  
  mostrarStatusMesa() {
    this.popover.dismiss();
    if(this.estabKey == this.checkinService.getEstabelecimento().key &&
    this.checkinService.getEstabelecimento().key != ''){ // mostra o popup apenas se o usuário tiver feito checkin no estabelecimento
      this.db.getMesa(this.estabKey, this.mesaKey).subscribe( mesa => {
        this.mesaescolhida.key = mesa.$key;
        this.mesaescolhida.numero = mesa.numero;
        this.mesaescolhida.status = mesa.status;
      });

      this.popover.data = {
        mesa: this.mesaescolhida,
        estab: this.estabelecimento
      };
      this.popover.present({
          //ev: ev
      });
    }
  }
  mostraPedidos(){
    for (let pedido of this.checkinService.getPedidos()){
      console.log(pedido);
    }
  }
  mostrarCardapio() {
    this.navCtrl.push(CardapioPage, { estabelecimento: this.estabelecimento });
  }

}