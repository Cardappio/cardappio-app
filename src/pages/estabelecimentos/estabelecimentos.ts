import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// mudei para a nossa classe local
//import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { DataService } from '../../services/data-service';
import { EstabelecimentoDetails } from '../estabelecimento-details/estabelecimento-details';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Utils } from '../../classes/utils';

@Component({
  selector: 'page-estabelecimentos',
  templateUrl: 'estabelecimentos.html'
})
export class EstabelecimentosPage {

  estabArray: Array<any>;
  originalEstabArray: Array<any>;

  constructor(public navCtrl: NavController,  private db: DataService, private utils: Utils  /*public db: AngularFireDatabase*/) {
    this.estabArray = new Array;
    this.originalEstabArray = new Array;
  }

  ngOnInit() {
    this.iniciarEstabelecimentos();
  }

  iniciarEstabelecimentos(){
    this.db.setLimit(10); 
    this.db.getRedes().subscribe( redes => {  // retorna array de redes do bd
        redes.forEach(rede => { // varre todas as redes
          /* retorna array de estabelecimentos do bd, de acordo com o key da rede */
          let tmpRedeKey = rede.key;
          this.db.setLimit(1); // Mudar valor do Limit
          this.db.getEstabelecimentos(rede.key).subscribe( estabelecimentos => { 
              estabelecimentos.forEach(estabelecimento => { // varre todos os estabelecimentos
                  let tmpEstab = new Estabelecimento();
                  let tmpMesas = this.listamesas(estabelecimento.key);
                  tmpEstab.mesas = tmpMesas;
                  tmpEstab.key = estabelecimento.key;
                  this.utils.mergeObj(estabelecimento.val(), tmpEstab); // copia o objeto remoto para o local
                  this.originalEstabArray.push(tmpEstab); // inserimos no array de estabelecimentos (usado para fins de pesquisa)
              });
              
          });
        });
        this.estabArray = this.originalEstabArray;       
   });
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

  showOptions(estabelecimento, estabKey){
    this.navCtrl.push(EstabelecimentoDetails, {estabelecimento, estabKey});
  }

  pesquisar(nome){
    let term: string = nome.target.value || '';
    if (term.trim() === '' || term.trim().length < 3){
      this.estabArray = this.originalEstabArray;
    }else{
      this.estabArray = [];
      this.originalEstabArray.forEach(element => {
          let aux: string = element.nome;
          if( aux.toLowerCase().includes(term.toLowerCase())){
            this.estabArray.push(element);
           }
      });
    }
  }

}