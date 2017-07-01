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
import { Mesa } from '../../classes/mesa';
import { Pedido } from '../../classes/pedido';
import { ItemPedido } from '../../classes/itempedido';
import { Produto } from '../../classes/produto';


declare var google;
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {
  redeArray: Rede[];
  redeOriginalArray: Rede[];
  keyRedeSelecionada: string = "chocolatras";
  constructor(private db: DataService, private utils: Utils, private alertCtrl: AlertController) {
      this.redeArray = [];
      this.redeOriginalArray = [];
  }
  ngOnInit() {
    this.iniciarEstabelecimentos();
  }
  iniciarEstabelecimentos(){
    this.db.setLimit(10); 
    this.db.getRedes().subscribe( redes => {  // retorna array de redes do bd
        redes.forEach(rede => { // varre todas as redes
          let tmpRede = new Rede();
          /* retorna array de estabelecimentos do bd, de acordo com o key da rede */
          tmpRede.key = rede.key;
          this.utils.mergeObj(rede.val(), tmpRede); // copia o objeto remoto para o local
          this.db.setLimit(3); // Mudar valor do Limit
          this.db.getEstabelecimentos(rede.key).subscribe( estabelecimentos => { 
              estabelecimentos.forEach(estabelecimento => { // varre todos os estabelecimentos
                  let tmpEstab = new Estabelecimento();
                  let tmpMesas = this.listamesas(estabelecimento.key);
                  tmpEstab.mesas = tmpMesas;
                  tmpEstab.key = estabelecimento.key;
                  this.utils.mergeObj(estabelecimento.val(), tmpEstab); // copia o objeto remoto para o local
                  tmpRede.estabelecimentos.push(tmpEstab);  // inserimos no array de estabelecimentos (usado para fins de pesquisa)
              });
              
              this.redeOriginalArray.push(tmpRede);
              if(tmpRede.key == this.keyRedeSelecionada){
                this.redeArray.push(tmpRede);
              }
          });
        });
        console.log(this.redeArray);
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
              // pega pedidos
              let pedidosTmp = this.listapedidos(idstab, mesa.key);
              tmpMesa.pedidos = pedidosTmp;
              mesasArrayTmp.push(tmpMesa);
          });
      });
      return mesasArrayTmp;
  }
  /* listar pedidos */
  listapedidos(stabKey: string, mesaKey: string){
        let pedidosTmpArray: Array<Pedido> = new Array();
        this.db.getPedidosMesa(stabKey, mesaKey).subscribe(pedidos => {  // retorna array de mesas do bd de acordo com o key do stab
            pedidos.forEach(pedido => { 
                /*
                fiz esse for aqui pra eviter que o array local fique duplicando os valores, 
                observei que isso ocorre sempre que se altera qualquer valor no firebase,
                ou seja, toda vez que o firebase atualiza, esse método aqui é chamado
                */
                let novo: boolean = true;
                for(let rede of this.redeArray){
                    for(let estab of rede.estabelecimentos){
                        for(let mesa of estab.mesas){
                            for(let pedidoLocal of mesa.pedidos){
                                if(pedidoLocal.key === pedido.key){
                                    novo = false; // aqui faz com que o objeto não seja incluso
                                }
                            }
                        }
                    }
                }
                let pedidoTmp = new Pedido();
                pedidoTmp.key = pedido.key;
                this.utils.mergeObj(pedido.val(), pedidoTmp);
                
                if(pedido.val().itens !== undefined){ // garantir que tem algo aqui
                    for(let k in pedido.val().itens){
                        try{
                            let itemTmp = new ItemPedido();
                            let prodTmp = new Produto();
                            this.db.getProduto(stabKey, "sobremesa", k).subscribe(prod => {
                                try{
                                this.utils.mergeObj(prod.val(), prodTmp);
                                }catch(e){}
                                
                            });
                            this.utils.mergeObj(pedido.val().itens[k], itemTmp);
                            prodTmp.key = k;
                            itemTmp.produto = prodTmp;
                            pedidoTmp.itens.push(itemTmp);
                        }catch(err){
                            console.log(err);
                        }
                    }
                }
                
                if(novo){
                    pedidosTmpArray.push(pedidoTmp);
                }
            });
        });
        return pedidosTmpArray;        
  }
  settings(){
    
    let settings = this.alertCtrl.create();
    settings.setTitle('Defina a rede a ser administrada');
    this.redeOriginalArray.forEach(rede => {
      let check = false;
      if(this.keyRedeSelecionada == rede.key){
        check = true;
      }
      settings.addInput({
        type: 'radio',
        label: rede.nome,
        value: rede.key,
        checked: check
      });
    })
    
    settings.addButton('Cancelar');
    settings.addButton({
      text: 'OK',
      handler: data => {
        this.keyRedeSelecionada = data;
        this.iniciarEstabelecimentos();
      }
    });
    settings.present();
  
  }
  atualizaPedido(status: string, stabKey: string, mesaKey: string, pedidoKey: string){
    this.db.atualizaPedido(status, stabKey, mesaKey, pedidoKey);
  }
}