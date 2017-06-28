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

  public myImage: string[];
  estabelecimento: Estabelecimento;

  constructor(public navCtrl: NavController, 
  public bcScan: BarcodeScanner, 
  private db: DataService,
  private utils: Utils,
  public alertCtrl: AlertController,
  private checkinService: CheckinService) {
      this.myImage = [];
      this.estabelecimento = new Estabelecimento();
  }
  ionViewDidLoad(){
    //this.lerqrcode(); // funcionamento no celular
    // 
    //this.checkin("-Kmb-c0vLJkXbLdaEXmk", "-Kmb0HALJ0J_DyYuD3Fe", "-Kmb1ELGBL7E9B9de7bO"); // para teste no desktop
    console.log("Efetuando checkin ...");

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
    console.log("Checkin: " + redeKey);
    // Verifica se já realizou checkin anteriormente
    if(!this.checkinService.getChecado()) {
      let estab = new Estabelecimento();
      let mes = new Mesa();
      
      this.db.getMesa(estabKey, mesaKey).subscribe(mesa => {
        // Verifica se essa Mesa está sendo usada
        if(mesa.status == 'livre') { // caso a mesa esteja livre, ele pode fazer checkin
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
              // Atualiza status da mesa no Firebase
              this.db.updateMesa(estabKey, mesa.$key, "ocupada");  
              // Carrega os dados do pedido e salva em CheckService
              this.mostrarPedido();
            });
            
          });
          // Abre tela do estabelecimento em que foi feito checkin
          this.showOptions(redeKey, estabKey, mesa.$key);
        }/*else {
          this.showAlertMesaOcupada();
        }*/
      });
      
    }else{
      this.showAlertCheckinJaRealizado();
    }

    // TODO: enviar dados para o servidor
    // TODO: solicitar aprovacao do gerente
    
  }

  // Carrega os dados do pedido e salva em CheckService
  mostrarPedido() {
    let estabKey = this.checkinService.getEstabelecimento().key;
    let mesaKey = this.checkinService.getMesa().key;
    let pedido = new Pedido();
    this.db.getPedidosMesa(estabKey, mesaKey).subscribe(pedidoMesa => {
      pedidoMesa.forEach(pedidoM => {
        pedido.key = pedidoM.key;
        pedido.estabKey = estabKey;
        pedido.mesaKey = mesaKey;
        pedido.status = pedidoM.val().status;
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
            pedido.itens.push(itemTmp);
          });
        });
      });
    });
    this.checkinService.setPedido(pedido);
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
    this.db.updateMesa(this.checkinService.getEstabelecimento().key, this.checkinService.getMesa().key, "livre");
    this.checkinService.setChecado(false);
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
