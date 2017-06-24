import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController  } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DataService } from '../../services/data-service';
import { EstabelecimentoDetails } from '../estabelecimento-details/estabelecimento-details';
import { Rede } from '../../classes/Rede';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Utils } from '../../classes/utils';

@Component({
  selector: 'page-estabelecimentos',
  templateUrl: 'estabelecimentos.html'
})

export class EstabelecimentosPage {
  latUsuario: any; // para armazenar a posicao
  lngUsuario: any; // para armazenar a posicao
  raio: Number = 50000; // armazena o valor do raio limite de filtro dos estabelecimentos
  public toggled: boolean;
  redeArray: Rede[] ;
  originalRedeArray: Rede[];

  constructor(public navCtrl: NavController,  private alertCtrl: AlertController , private db: DataService, private utils: Utils, public geolocation: Geolocation) {
    this.toggled = false;
    this.redeArray = [];
    this.originalRedeArray = [];
  }

  ngOnInit() {
    this.iniciarEstabelecimentos();
  }

  toggleSearch() {
       this.toggled = this.toggled ? false : true;
       this.redeArray = this.originalRedeArray;
  }

  iniciarEstabelecimentos(){
    this.db.setLimit(10); 
    this.db.getRedes().subscribe( redes => {  // retorna array de redes do bd
        redes.forEach(rede => { // varre todas as redes
          let tmpRede = new Rede();
          /* retorna array de estabelecimentos do bd, de acordo com o key da rede */
          tmpRede.key = rede.key;
          this.db.setLimit(3); // Mudar valor do Limit
          this.db.getEstabelecimentos(rede.key).subscribe( estabelecimentos => { 
              estabelecimentos.forEach(estabelecimento => { // varre todos os estabelecimentos
                  let tmpEstab = new Estabelecimento();
                  let tmpMesas = this.listamesas(estabelecimento.key);
                  tmpEstab.mesas = tmpMesas;
                  tmpEstab.key = estabelecimento.key;
                  this.utils.mergeObj(estabelecimento.val(), tmpEstab); // copia o objeto remoto para o local
                  tmpRede.estabelecimentos.push(tmpEstab);  // inserimos no array de estabelecimentos (usado para fins de pesquisa)
                  //this.originalEstabArray.push(tmpEstab); // inserimos no array de estabelecimentos (usado para fins de pesquisa)
              });
              
              this.originalRedeArray.push(tmpRede);
          });
        });
        this.redeArray = this.originalRedeArray;       
   });
    this.aplicaraio(this.raio); 
  }

  /* Listar mesas */
  listamesas(idstab: string){
      let mesasArrayTmp: Array<any>;
      mesasArrayTmp = []; 
      this.db.setLimit(3); 
      this.db.getMesas(idstab).subscribe( mesas => {  // retorna array de mesas do bd de acordo com o key do stab
          mesas.forEach(mesa => { // varre todos os estabelecimentos
              let tmpMesa = new Mesa();
              tmpMesa.key = mesa.key;
              this.utils.mergeObj(mesa.val(), tmpMesa);
              mesasArrayTmp.push(tmpMesa);
          });
      });
      return mesasArrayTmp;
  }

  showOptions(redeKey, estabKey){
    //Fecha pesquisa após selecionar estabelecimento
    if(this.toggled)
      this.toggleSearch();
    this.navCtrl.push(EstabelecimentoDetails, {redeKey, estabKey});
  }

  pesquisar(nome){
    let term: string = nome.target.value || '';
    if (term.trim() === '' || term.trim().length < 3){
      this.redeArray = this.originalRedeArray;
    }else{
      this.redeArray = [];  // limpa o array de redes
      this.originalRedeArray.forEach(rede => {
          let tmpRede = new Rede(); // rede temporaria para armazenar apenas as buscadas
          rede.estabelecimentos.forEach(estab => {
            let aux: string = estab.nome;
            let dist = this.utils.calcdist(this.latUsuario, this.lngUsuario, estab.latitude, estab.longitude);
            if((+dist <= +this.raio) && aux.toLowerCase().includes(term.toLowerCase())){
                tmpRede.estabelecimentos.push(estab); // checa o nome do estabelecimento e adiciona na rede temporaria
            }
          });
          this.redeArray.push(tmpRede); // adiciona a rede temporaria no array a ser impresso
      });
    }
  }

  /*
  função aplicaraio(raio: Number) // lembrar de mudar esse nome antes de mostrar pra professora :)
  pega um valor em metros para o raio, que representa a distancia entre o usuario
  e o limite, e filtra os estabelecimentos que estiverem a uma distância 
  maior que este valor.
  */
  aplicaraio(raio: Number){
    this.redeArray = []; // limpa o array padrão para inserir apenas os dados condizentes com os criterios
    this.originalRedeArray.forEach(rede => {
      let tmpRede = new Rede(); // rede temporaria para armazenar apenas as que interessam
      rede.estabelecimentos.forEach( estab => {
        let dist;
        if(this.latUsuario || this.lngUsuario){
            dist = this.utils.calcdist(this.latUsuario, this.lngUsuario, estab.latitude, estab.longitude);
        }else{ 
            /*
             só chama get position se não tiver registrado ainda a pos do usuario
             como o geolocation consome muito recurso, avaliar se é melhor armazenar 
             a pos do usuario em um cache, pra ser usado durante toda a sessão
            */
            this.getPosition();
            dist = this.utils.calcdist(this.latUsuario, this.lngUsuario, estab.latitude, estab.longitude);
        }
          
          if(dist <= raio){
              console.log("distancia: " + dist +"/ raio: "+ raio +"/"+this.latUsuario);
              tmpRede.estabelecimentos.push(estab); // checa o se a distancia é menor ou igual e adiciona ao array temporario
          }
        
      });
       this.redeArray.push(tmpRede); // adiciona a rede temporaria no array a ser impresso
    });
  }
  getPosition() {
    this.geolocation.getCurrentPosition()
        .then((position) => {
            this.latUsuario = position.coords.latitude;
            this.lngUsuario = position.coords.longitude
        }, (err) => {
            console.log(err);
            // TODO: Apresentar Alert de erro
        });
  }
  settings(){
    let opcoes : number[] = [100, 50, 20, 10, 5, 1, 0.5, 0.1];
    let settings = this.alertCtrl.create();
    settings.setTitle('Defina a distância para busca');
    opcoes.forEach(km => {
      let check = false;
      if(this.raio == (km * 1000)){
        check = true;
      }
      settings.addInput({
        type: 'radio',
        label: 'até ' + km + ' KM',
        value: (km * 1000) + '',
        checked: check
      });
    })
    
    settings.addButton('Cancelar');
    settings.addButton({
      text: 'OK',
      handler: data => {
        this.raio = data;
        this.aplicaraio(this.raio); 
      }
    });
    settings.present();
  
  }
}