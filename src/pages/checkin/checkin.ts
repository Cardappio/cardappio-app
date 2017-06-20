import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { DataService } from '../../services/data-service';
import { Estabelecimento } from '../../classes/estabelecimento';
import { EstabelecimentoDetails } from '../estabelecimento-details/estabelecimento-details';
import { Utils } from '../../classes/utils';

@Component({
  selector: 'page-checkin',
  templateUrl: 'checkin.html'
})
export class CheckinPage {
  titulo = 'Check-In';
  icone = 'qr-scanner';
  public myImage: string[];
  private estabelecimentos: Estabelecimento[];

  constructor(public navCtrl: NavController, 
  public bcScan: BarcodeScanner, 
  private db: DataService,
  private utils: Utils,
  public alertCtrl: AlertController) {
      this.myImage = []; 
      this.estabelecimentos = [];
  }
  ionViewDidLoad(){
    //this.lerqrcode(); // funcionamento no celular
    // 
    this.checkin("-Kmb-c0vLJkXbLdaEXmk", "-Kmb0HALJ0J_DyYuD3Fe", "-Kmb1KBfT2UMdU6oPhyG"); // para teste no desktop

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
              this.checkin(dados.split("__")[0], dados.split("__")[1], dados.split("__")[0],);
        }, (err) => {
            console.log("Erro: " + err);
        });
  }
  checkin(rede: string, estab: string, mesa: string){
    this.db.updateMesa(estab, mesa, "aguardando");
    this.showOptions(rede, estab, mesa);
    // TODO: enviar dados para o servidor
    // TODO: solicitar aprovacao do gerente
    
  }
  showOptions(redeKey, estabKey, mesaKey){
    this.navCtrl.push(EstabelecimentoDetails, {redeKey, estabKey, mesaKey});
  }
}
