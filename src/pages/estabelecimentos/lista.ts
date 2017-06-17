import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// mudei para a nossa classe local
//import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { DataService } from '../../services/data-service';
import { EstabelecimentoDetails } from '../estabelecimento-details/estabelecimento-details';
import { Rede } from '../../classes/Rede';
import { Estabelecimento } from '../../classes/estabelecimento';
import { Mesa } from '../../classes/mesa';
import { Utils } from '../../classes/utils';

@Component({
  selector: 'view-lista',
  templateUrl: 'lista.html'
})
export class ListaView {


 // estabelecimentos: FirebaseListObservable<any[]>;  // mudei para nossa classe local
  estabArray: Array<any>;
  originalEstabArray: Array<any>;
  private estabelecimentos: Estabelecimento[];
  private redes: Rede[];

  constructor(public navCtrl: NavController,  private db: DataService, private utils: Utils  /*public db: AngularFireDatabase*/) {
    //this.estabelecimentos = db.list('/estabelecimentos');
    this.estabArray = new Array;
    this.originalEstabArray = new Array;
    this.redes = new Array;
    this.estabelecimentos = new Array;
    this.iniciarEstabelecimentos();
    this.estabArray = this.originalEstabArray;
  }

  /*
  iniciarEstabelecimentos(){
    this.getDB('/estabelecimentos').subscribe( snapshot => {
      snapshot.forEach(redes => {
        this.getDB('/estabelecimentos/'+redes.key).subscribe(estabelecimento =>{
          estabelecimento.forEach(dados => {
            console.log(dados);
            this.originalEstabArray.push(dados);
          });
        });
      });
    });
  }
  

  getDB(url: string): FirebaseListObservable<any>{
    return this.db.list(url, {preserveSnapshot: true});
  }
*/
  /*
  Felipe, fiz aqui algumas alterações na tua função original, porque estávamos usando a 
  função da classe data-service nas outras pages, se quiser reverter, fica à vontade
  */

  iniciarEstabelecimentos(){
    this.db.setLimit(10); 
    this.db.getRedes().subscribe( redes => {  // retorna array de redes do bd
        redes.forEach(rede => { // varre todas as redes
          /* retorna array de estabelecimentos do bd, de acordo com o key da rede */
          let tmpRede = new Rede();
          tmpRede.key = rede.kek;
          tmpRede.nome = rede.nome;
          this.db.setLimit(1); 
          this.db.getEstabelecimentos(rede.key).subscribe( estabelecimentos => { 
              estabelecimentos.forEach(estabelecimento => { // varre todos os estabelecimentos
                  let tmpEstab = new Estabelecimento();
                  let tmpMesas = this.listamesas(estabelecimento.key);
                  tmpEstab.mesas = tmpMesas;
                  tmpEstab.key = estabelecimento.key;
                  this.utils.mergeObj(estabelecimento.val(), tmpEstab); // copia o objeto remoto para o local
                  tmpRede.estabelecimentos.push(tmpEstab);
              });
              
          });
          console.log("Tmp Rede: " + tmpRede);
          this.redes.push(tmpRede);
        });
        this.estabArray = this.estabelecimentos;
        console.log(this.redes);
        
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
    console.log(term);
    if (term.trim() === '' || term.trim().length < 3){
      this.estabArray = this.estabelecimentos;
    }else{
      this.estabArray = [];
      this.redes.forEach(rede => {
        rede.estabelecimentos.forEach(estab => {
            let aux: string = estab.nome;
            if( aux.toLowerCase().includes(term.toLowerCase())){
              this.estabArray.push(estab);
            }
        });
      });

    }

  }

}