import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Http } from '@angular/http';
import { Estabelecimento } from './estabelecimento';
import 'rxjs/add/operator/map';


declare var google;
@Component({
  selector: 'page-mapa',
  templateUrl: 'mapa.html'
})
export class MapaPage {

  titulo = "Mapa";
  icone = 'navigation';

  @ViewChild('map') mapElement;
  private map: any;
  private estabelecimentos: Estabelecimento[];
  private connectionStatus: boolean = false;
  latUsuario: any;  // para receber a posição do usuário (latitude)
  lngUsuario: any;  // para receber a posição do usuário (longitude)
  latLngUsuario: any; // para armazenar a pos atual do usuario ou pos default
  latDest: any; // armazenar dados para calculo da rota
  lngDest: any; // armazenar dados para calculo da rota

  infowindow : any;
  marker: any;

  constructor(
    public navCtrl: NavController, 
    public network: Network, 
    public platform: Platform, 
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public http: Http) {
        this.estabelecimentos = [];
        this.infowindow = [];
        this.marker = [];
    }

  ionViewDidLoad(){
      if(this.platform.is('mobile')){
          this.network.onConnect().subscribe(data => {
            this.connectionStatus = true;
            console.log("Conectado");
          }, error => console.error(error));
        
          this.network.onDisconnect().subscribe(data => {
            this.connectionStatus = false;
            console.log("desConectado");
            this.showAlert();
          }, error => console.error(error));
      }else{
          this.connectionStatus = true;
      }
      
      if(this.connectionStatus){
        this.initMap();
      }
     
  }

  initMap(){
        // TODO: tem que ver o caso em que a posição não foi encontrada
      let latLng: any;
      this.geolocation.getCurrentPosition().then((position) => {
        this.latUsuario = position.coords.latitude;
        this.lngUsuario = position.coords.longitude;
        let latLng = new google.maps.LatLng(this.latUsuario, this.lngUsuario);
        let mapOptions = {
      center: latLng,
      disableDefaultUI: true,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
         this.loadData();
      }, (err) => {
        console.log(err);
        let latLng = new google.maps.LatLng(-3.72839, -38.5234);
        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
         this.loadData();
      });

  }
  
  
    addMarker(){
        
      for (let key in this.estabelecimentos) {
        let latLng = new google.maps.LatLng(this.estabelecimentos[key].dados.getLat(), this.estabelecimentos[key].dados.getLng());
        let tmpmarker = new google.maps.Marker({
          map: this.map,
          icon: 'assets/icon/cardappio.png',
          animation: google.maps.Animation.DROP,
          position: latLng
        });
        this.marker.push(tmpmarker);
       
       /*
        ver uma forma de usar template para o infowindow depois
        */
        let desc = this.estabelecimentos[key].dados.getNome();
        let dist = this.calcdist(this.latUsuario, this.lngUsuario, this.estabelecimentos[key].dados.getLat(), this.estabelecimentos[key].dados.getLng());
        let content =   "<div id=\"infowindow\"><h3>" + 
                        desc + 
                        "<br></h3>À " + 
                        dist + 
                        " metros<div id=\"ifowindowsbuttons\"><img src=\"assets/icon/cardappio.png\"></div></div>";          
        let tmpinfowindow = new google.maps.InfoWindow({
            content: content
        })
        this.infowindow.push(tmpinfowindow);
        google.maps.event.addListener(this.marker[key], 'click', () => {
            this.infowindow[key].open(this.map, this.marker[key]);
            this.menuestabelecimento(key);
        });
        
      }
    }
   
    tracarota(lat: Number){
      let destination = this.latUsuario + ',' + this.lngUsuario
      let label = encodeURI('My Label');
    }

    menuestabelecimento(key: String){
        /*
        TODO: depois de muito bater cabeça, não consegui uma forma de registrar os cliques
        na infowindow nativa do mapa, então penso que a gente vai ter que ver uma forma
        de incluir manualmente, por exemplo, pra traçar a rota, a gente tem que ter as coordenadas 
        do estabelecimento, esta coordenadas vão estar registradas no objeto estabelecimentos[key]
        */
        
    }
  
    /* =============================================
            funções relacionadas ao websevice
    =============================================*/
    //TODO: função para reconhecer cliques dentro do infowindow, para por exemplo carregar a rota
    loadData(){
        // aqui estou carregando os restaurando a mais ou menos 500 metros de distância do local atual (quando não forem carregados os dados locais)
        let raio = 500; // TODO: fazer com que seja dinâmico, ou seja, quando o zoom do mapa for alterado, o raio também deve ser alterado
          /*
          No momento a url online só funciona no celular, na versão web, usar os dados offline (proximos do pici)
          na versão final, será usado webservice proprio (provavelmente firebase), então estas requisições provavelmente
          serão enviadas para uma classe separada
          =====================================================
          */
          //let url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + this.latUsuario +","+this.lngUsuario + "&radius="+ raio +"&type=restaurant&key=AIzaSyDLLDf1LsT8QVU1YHTER1fc7RCAarqVmVI";
          // local
          let url = "assets/dadosoffline.json";
          
          this.http.get(url).map(res => res.json()).subscribe(data => {
            let counter = 0;
            for (let key in data.results) {
                this.estabelecimentos.push(new Estabelecimento());
                this.estabelecimentos[counter].dados.setNome(data.results[key].name);
                let newlat = data.results[key].geometry.location.lat;
                let newlng = data.results[key].geometry.location.lng;
                this.estabelecimentos[counter].dados.setLat(newlat);
                this.estabelecimentos[counter].dados.setLng(newlng);
                counter++;
            }
            this.addMarker();
            
        });
        
    }
    /* ==================================
            funções auxiliares
    =====================================*/

    degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
    }

    calcdist(lat1, lng1, lat2, lng2) {
      var earthRadiusKm = 6371;

      var dLat = this.degreesToRadians(lat2-lat1);
      var dLng = this.degreesToRadians(lng2-lng1);

      lat1 = this.degreesToRadians(lat1);
      lat2 = this.degreesToRadians(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      // retorno em metros
      return (earthRadiusKm * c * 1000).toFixed(0);
    }

  /*
  TODO: Separar em uma classe, pois deve ser usado em vários locais
  */
  showAlert() {
  let confirm = this.alertCtrl.create({
      title: 'Sem conexão com internet?',
      message: 'é necessário ativar sua conexão com internet',
      buttons: [
        {
          text: 'Sair',
          handler: () => {
            console.log('Sair clicado');
            /* fchar o app */
          }
        },
        {
          text: 'Ativar',
          handler: () => {
            console.log('Ativr clicado');
            /* Abrir configuração de rede */
          }
        }
      ]
    });
    confirm.present();
  }
  

}
