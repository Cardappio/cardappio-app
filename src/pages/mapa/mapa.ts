import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Rede } from '../../classes/Rede';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { DataService } from '../../services/data-service';
import { Utils } from '../../classes/utils';


declare var google;
@Component({
  selector: 'page-mapa',
  templateUrl: 'mapa.html'
})
export class MapaPage {

  @ViewChild('map') mapElement;
  private map: any;
  private estabelecimentos: Estabelecimento[];
  private redes: Rede[];
  keyEstAtivo: any;
  infowindow : any;
  marker: any;
  userPos: Geoposition;
  latUsuario: any;  // para receber a posição do usuário (latitude)
  lngUsuario: any;  // para receber a posição do usuário (longitude)
  private limitelista = 10;
  private connectionStatus: boolean = true;

  constructor(public navCtrl: NavController, 
              public alertCtrl: AlertController,
              public geolocation: Geolocation, 
              public network: Network, 
              public http: Http,
              private utils: Utils,
              private db: DataService) {
      this.estabelecimentos = [];
      this.infowindow = [];
      this.marker = [];
  }

  // Ações realizadas ao iniciar o mapa
  ionViewDidLoad(){
      // Se há conexão com internet
      this.network.onConnect()
          .subscribe(data => {
            this.connectionStatus = true;
          }, error => console.error(error));

      // Se não há conexão com internet
      this.network.onDisconnect()
          .subscribe(data => {
            this.connectionStatus = false;
            this.showAlert();
          }, error => console.error(error));

      // Caso esteja conectado, carregamos o mapa   
      if(this.connectionStatus){
        this.initMap();
      }
      
  }

  // Carrega mapa e variáveis necessárias
  initMap(){
    // TODO: tem que ver o caso em que a posição não foi encontrada

    // Coordenadas default somente para iniciar o mapa
    let latLng = new google.maps.LatLng(-3.7449157, -38.5764296);
    let mapOptions = {
      center: latLng,
      disableDefaultUI: true,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // Carrega mapa
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // Pegamos posição atual e recentramos o mapa
    this.getPosition();

    // Carega dados do mapa
    this.loadData();
  }

  getPosition(){
    this.geolocation.getCurrentPosition()
        .then((position) => {
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.latUsuario = position.coords.latitude;
            this.lngUsuario = position.coords.longitude
            this.map.setCenter(latLng);
        }, (err) => {
            console.log(err);
            this.showAlertPosition();
        });
  }

  //TODO: função para reconhecer cliques dentro do infowindow, para por exemplo carregar a rota
  loadData(){
      // Carrega estabelecimentos a 500 metros de distância do local atual (quando não forem carregados os dados locais)
      // TODO: fazer com que seja dinâmico, ou seja, quando o zoom do mapa for alterado, o raio também deve ser alterado
      let raio = 500;

      //TODO: Fazer consulta com LIMIT, para prevenir overflow quando houver muitos estabelecimentos
      this.db.setLimit(30); // tem que testar se funiona esse método, porque ainda tem poucos itens
      this.db.getRedes().subscribe(redes => {
          redes.forEach(rede => {
            this.db.getEstabelecimentos(rede.key).subscribe(stabs => {
              stabs.forEach(stab => {
                  let tmpEstab = new Estabelecimento();
                  tmpEstab.key = stab.key;
                  this.utils.mergeObj(stab.val(), tmpEstab); // aqui copiamos os dados do bd para nosso objeto local
                  this.estabelecimentos.push(tmpEstab);
              });  
            this.addMarker();
            });
          });
      
      });
  }
  
  // Adiciona marcadores ao mapa para cada estabelecimento
  addMarker() {
    this.estabelecimentos.forEach((estab, index) => {
      let latLng = new google.maps.LatLng(estab.latitude, estab.longitude);
      let tmpmarker = new google.maps.Marker({
        map: this.map,
        icon: 'assets/icon/cardappio.png',
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      this.marker.push(tmpmarker);

      /* TODO: ver uma forma de usar template para o infowindow depois */
      let desc = estab.nome;
      let dist = this.utils.calcdist(this.latUsuario, this.lngUsuario, estab.latitude, estab.longitude);
      let content =   "<div id=\"infowindow\"><h3>" + 
                      desc + 
                      "<br></h3>À " + 
                      dist + 
                      " metros<div id=\"ifowindowsbuttons\"><img src=\"assets/icon/cardappio.png\">" +
                      "<br> Funcionamento: " + 
                      estab.horario_funcionamento + 
                      "</div></div>";       
              
      let tmpinfowindow = new google.maps.InfoWindow({
          content: content
      })

      this.infowindow.push(tmpinfowindow);
      google.maps.event.addListener(this.marker[index], 'click', () => {
          this.infowindow[index].open(this.map, this.marker[index]);
          this.keyEstAtivo = index;
      });
      
    });
  }

  tracarota(){
    if(this.keyEstAtivo > -1){ // gambiarra feiona, tem que consertar mas não consegui um jeito ainda
        let latDest = this.estabelecimentos[this.keyEstAtivo].latitude;
        let lngDest = this.estabelecimentos[this.keyEstAtivo].longitude;
        let nome = this.estabelecimentos[this.keyEstAtivo].nome;
        let label = encodeURI(nome.toString()); // encode the label!
        window.open('geo:'+ latDest +', ' + lngDest +'?q='+ latDest +', ' + lngDest + '(' + label + ')', '_system');
        
    }else{
        this.showAlertNoSelect();
    }
  }

  getLatUsuario(){
    return this.latUsuario;
  }
  getLngUsuario(){
    return this.lngUsuario;
  }

  

  // TODO: Separar em uma classe, pois deve ser usado em vários locais
  showAlert() {
  let confirm = this.alertCtrl.create({
      title: 'Sem conexão com internet?',
      message: 'é necessário ativar sua conexão com internet',
      buttons: [
        {
          text: 'Sair',
          handler: () => {
            /* fchar o app */
          }
        },
        {
          text: 'Ativar',
          handler: () => {
            /* Abrir configuração de rede */
          }
        }
      ]
    });
    confirm.present();
  }
  
  showAlertPosition() {
  let confirm = this.alertCtrl.create({
      title: 'Posição não encontrada',
      message: '<h3>não foi possível registrar sua posição no mapa<h3>',
      buttons: [
        {
          text: 'Sair',
          handler: () => {
            /* fchar o app */
          }
        }
      ]
    });
    confirm.present();
  }

  showAlertNoSelect() {
      let confirm = this.alertCtrl.create({
      title: 'Selecione um Destino',
      message: 'é necessário selecionar um destino para traçar a rota',
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
