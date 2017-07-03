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

  checado: boolean = false;
  mesa: Mesa;
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
    this.mesa = new Mesa();
    this.estabelecimento = new Estabelecimento();
    this.pedidos = [];
  }
  
  ionViewDidLoad() {
    this.iniciarCampos();
  }

  iniciarCampos() {
    this.checkinService.getChecado().subscribe(checado => {
      this.checado = checado;
      if(this.checado) {
        this.checkinService.getEstabelecimento().subscribe(estab => {
          this.estabelecimento = estab;
        });
        this.checkinService.getMesa().subscribe(mesa => {
          this.mesa = mesa;
        });
        this.checkinService.getPedidos().subscribe(pedidos => {
          this.pedidos = pedidos;
        });
      }
    });
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
              this.checkin(dados.split("__")[0], dados.split("__")[1], dados.split("__")[2]);
        }, (err) => {
            console.log("Erro: " + err);
        });
  }

  checkin(redeKey: string, estabKey: string, mesaKey: string){
    this.stabKey = estabKey;
    this.mesaKey = mesaKey;
    this.redeKey = redeKey;
    let jaChecado;
    this.checkinService.getChecado().subscribe(_jaChecado => {
      jaChecado = _jaChecado;
    });
    // Verifica se já realizou checkin anteriormente
    if(/*!jaChecado*/true) {
      let estab = new Estabelecimento();
      let mes = new Mesa();
      let checado = false;
      this.db.getMesa(estabKey, mesaKey).subscribe(mesa => {
        // Verifica se essa Mesa está sendo usada
        if(mesa.status == 'livre'){

          // Carrega dados do estabelecimento e salva em CheckinService
          this.db.getEstabelecimento(redeKey, estabKey).subscribe(estabelecimento => {
            estab.key = estabelecimento.key;
            this.utils.mergeObj(estabelecimento.val(), estab);          
          });

          // Preenche dados da mesa
          mes.key = mesaKey;
          mes.numero = mesa.numero;
          mes.status = 'aguardando';

          this.db.updateMesa(estabKey, mesaKey, "aguardando");
          checado = true;
        }else {
          // TODO: Mostrar alert de erro
        }
      });
      this.checkinService.setMesa(mes);
      this.checkinService.setEstabelecimento(estab);
      this.checkinService.setChecado(checado);
      this.checkinService.setPedidos();

      this.iniciarCampos();
    }else{
      //this.showAlertCheckinJaRealizado();
    }
    this.showOptions(redeKey, estabKey, mesaKey);
    // TODO: enviar dados para o servidor
    // TODO: solicitar aprovacao do gerente
    
  }

  showPedidos(){
    this.checkinService.getPedidos().subscribe(pedidos => {
      pedidos.forEach(pedido => {
        pedido.itens.forEach(item => {
          console.log(item);
        });
      });
    });
  }

  // Carrega os dados do pedido e salva em CheckService
  carregaPedidos() {
    let estabKey = this.stabKey;
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
    this.checkinService.getEstabelecimento().subscribe(estabelecimento => {
      estab = estabelecimento;
    });
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
