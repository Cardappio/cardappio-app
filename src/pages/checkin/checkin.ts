import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { DataService } from '../../services/data-service';
import { CheckinService } from '../../services/checkin-service';

import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Pedido } from '../../classes/pedido';
import { ItemPedido } from '../../classes/itempedido';
import { Produto } from  '../../classes/produto';
import { Utils } from '../../classes/utils';

import { EstabelecimentoDetails } from '../estabelecimento-details/estabelecimento-details';
import { CardapioPage } from '../cardapio/cardapio';

@Component({
  selector: 'page-checkin',
  templateUrl: 'checkin.html'
})
export class CheckinPage {

  estabelecimento: Estabelecimento;
  private pedidos: Array<Pedido>;

  /* variaveis para debug do checkin sem leitor de qrcode */
  private redeKey: string = "chocolatras"; // para debug
  private stabKey: string = "garoto"; // para debug
  private mesaKey: string = "mesa1"; // para debug

  constructor(public navCtrl: NavController, 
  public bcScan: BarcodeScanner, 
  private db: DataService,
  private utils: Utils,
  public alertCtrl: AlertController,
  private checkinService: CheckinService) {
      this.estabelecimento = new Estabelecimento();
      this.pedidos = [];
  }
  
  ionViewDidLoad() {
    if(this.checkinService.getChecado()){ // se fez checkin, pega os pedidos para atualizar em tempo real
      //this.carregaPedidos();
    }
  }
  /*
  Aqui o código deve estar no formado x__y__z, onde:
  x identifica a rede de estabelecimentos
  y identifica o estabelecimento dentro da rede
  z identifica a mesa dentro do estabelecimento
  */
  lerqrcode(){
      let dados: any;
        this.bcScan.scan().then((barcodeData) => {
            dados = barcodeData.text;
            // criar teste para checar a integridade dos dados antes de enviar para o checkin
              this.checkin(dados.split("__")[0], dados.split("__")[1], dados.split("__")[0]);
        }, (err) => {
            console.log("Erro: " + err);
        });
  }
  checkin(redeKey: string, estabKey: string, mesaKey: string){
    this.stabKey = estabKey;
    this.mesaKey = mesaKey;
    this.redeKey = redeKey;
    // Verifica se já realizou checkin anteriormente
    if(/*!this.checkinService.getChecado()*/true) {
      let estab = new Estabelecimento();
      let mes = new Mesa();
      
      this.db.getMesa(estabKey, mesaKey).subscribe(mesa => {
        // Verifica se essa Mesa está sendo usada
          this.checkinService.setChecado(true);

          // Carrega dados do estabelecimento e salva em CheckinService
          this.db.getEstabelecimento(redeKey, estabKey).subscribe(estabelecimento => {
            estab.key = estabelecimento.key;
            this.utils.mergeObj(estabelecimento.val(), estab);
            this.checkinService.setEstabelecimento(estab);
            
            // Carrega dados da mesa e salva em CheckinService
            this.db.getMesa(estabKey, mesaKey).subscribe(mesa => {
              mes.key = mesa.$key;
              mes.numero = mesa.numero;
              mes.status = mesa.status;
              this.checkinService.setMesa(mes);
            });
            
          });
          this.db.updateMesa(estabKey, mesaKey, "ocupada");
          // Abre tela do estabelecimento em que foi feito checkin
          
      });
      //this.carregaPedidos();
      this.checkinService.setPedidos();
    }else{
      //this.showAlertCheckinJaRealizado();
    }
    this.showOptions(redeKey, estabKey, mesaKey);
    // TODO: enviar dados para o servidor
    // TODO: solicitar aprovacao do gerente
    
  }
  showPedidos(){
    console.log(this.checkinService.getPedidos());
    for(let pedido of this.checkinService.getPedidos()){
      console.log(pedido);
      console.log(pedido.itens.length);
      for(let item in pedido.itens){
        console.log(item);
        console.log(pedido.itens[item].quantidade);
      }
    }
  }
  // Carrega os dados do pedido e salva em CheckService
  carregaPedidos() {
    let estabKey = this.mesaKey;
    let mesaKey = this.mesaKey;
    let pedidoTmp: Pedido;
    this.db.getPedidosMesa(estabKey, mesaKey).subscribe(pedidoMesa => {
      pedidoMesa.forEach(pedidoM => {
        pedidoTmp = new Pedido();
        pedidoTmp.key = pedidoM.key;
        pedidoTmp.estabKey = estabKey;
        pedidoTmp.mesaKey = mesaKey;
        pedidoTmp.status = pedidoM.val().status;
        this.db.getProdutosPedido(estabKey, mesaKey, pedidoM.key).subscribe(produtos => {
          produtos.forEach(produto => {
            let itemTmp = new ItemPedido();
            this.utils.mergeObj(produto.val(), itemTmp);
            let prodTmp = new Produto();
            prodTmp.key = produto.key;

            // Povoa dados do produto
            this.db.getCardapio(estabKey).subscribe( categorias => { // pega lista de categorias
              categorias.forEach(categoria => {  // loop na lista de categorias
                
                this.db.getItensCardapio(estabKey, categoria.key).subscribe( itens => { // pega lista de itens no cardápio
                  itens.forEach(item => { // loop nos itens do cardapio
                    if(item.key == prodTmp.key){
                      prodTmp.categoria = categoria.key;
                      this.utils.mergeObj(item.val(), prodTmp); // armazena os dados no objeto local
                    }
                  });
                });
              });
            });
            itemTmp.produto = prodTmp;
            console.log("Produto encontrado: " + prodTmp.nome);
            pedidoTmp.itens.push(itemTmp);
          });
        });
      });
      //console.log("Inserindo: " + pedidoTmp.itens[0].produto.nome);
    this.pedidos.push(pedidoTmp);  
    });
    
  }

  showOptions(redeKey, estabKey, mesaKey){
    this.navCtrl.push(EstabelecimentoDetails, {redeKey, estabKey, mesaKey});
  }

  showCardapio() {
    let estab = new Estabelecimento();
    estab = this.checkinService.getEstabelecimento();
    this.navCtrl.push(CardapioPage, estab);
  }
  checkOut(){
    this.checkinService.checkOut();
  }

  showAlertMesaOcupada() {
    let confirm = this.alertCtrl.create({
        title: 'Mesa Ocupada!',
        message: 'A mesa já encontra-se ocupada, por favor, tente outra.',
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

  showAlertCheckinJaRealizado() {
    let confirm = this.alertCtrl.create({
        title: 'Checkin Realizado!',
        message: 'Checkin já foi efetuado com sucesso.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              /* fchar o app */
            }
          }
        ]
      });
    confirm.present();
  }

}
