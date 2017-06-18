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
    this.lerqrcode(); // funcionamento no celular
    // 
    //this.checkin("-Kmb0HALJ0J_DyYuD3Fe", "-Kmb1KBfT2UMdU6oPhyG"); // para teste no desktop

  }

  /*
  Aqui o código deve estar no formado x__y, onde x é o identificador do estabelecimento, e y é o identificador da mesa
  verificar a compatibilidade com os ddos retornados do firebase
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
    let estabelecimentoescolhido = this.db.getEstabelecimento(estab);
    let tmpStab = new Estabelecimento();
    this.utils.mergeObj(estabelecimentoescolhido, tmpStab);
    this.db.updateMesa(estab, mesa, "aguardando");
    this.showOptions(tmpStab, estab, mesa);
    // TODO: enviar dados para o servidor
    // TODO: solicitar aprovacao do gerente
    
  }
  showOptions(estabelecimento, estabKey, idmesa){
    this.navCtrl.push(EstabelecimentoDetails, {estabelecimento, estabKey, idmesa});
  }
  checkout(estab: string, mesa: string){
    this.db.updateMesa(estab, mesa, "livre");
  }
}
