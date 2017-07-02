import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';

import { DataService } from './data-service';
import { Utils } from '../classes/utils';
import { Estabelecimento } from '../classes/estabelecimento';
import { Mesa } from '../classes/mesa';
import { Pedido } from '../classes/pedido';
import { ItemPedido } from '../classes/itempedido';
import { Produto } from '../classes/produto';

@Injectable()
export class CheckinService {
    
    private checado: boolean; // Condição se usuário efetuou checj-in ou não
    private estabelecimento: Estabelecimento; // Estabelecimento em que está checado
    private mesa: Mesa; // Mesa em que está checado
    private pedido: Pedido; // Pedido do usuário
    private pedidos: Array<Pedido>; // Pedidos do usuário

    constructor(private db: DataService, private utils: Utils) {
        this.checado = false;
        this.estabelecimento = new Estabelecimento();
        this.mesa = new Mesa();
        this.pedido = new Pedido();
        this.pedidos = new Array();
    }

    getChecado(): Observable<boolean> {
        return Observable.create(subscriber => {
            subscriber.next(this.checado);
        });
    }

    getEstabKey (): Observable<string> {
        return Observable.create(subscriber => {
            subscriber.next(this.estabelecimento.key);
        });
    }

    getEstabelecimento(): Observable<Estabelecimento> {
        return Observable.create(subscriber => {
            subscriber.next(this.estabelecimento);
        });
    }

    getMesa(): Observable<Mesa> {
        return Observable.create(subscriber => {
            subscriber.next(this.mesa);
        });
    }

    getPedido(): Observable<Pedido> {
        return Observable.create(subscriber => {
            subscriber.next(this.pedido);
        });
    }

    getPedidos(): Observable<Pedido[]>{
        return Observable.create(subscriber => {
            subscriber.next(this.pedidos);
        });
    }
    
    setPedidos() {
        let novo: boolean = true;
        this.pedidos = [];
        let estabKey;
        let mesaKey;
        this.getEstabKey().subscribe(key => {
            estabKey = key;
        });
        this.getMesa().subscribe(mesa => {
            mesaKey = mesa.key;
        });
        this.db.getPedidosMesa(estabKey, mesaKey).subscribe(pedidos => {
            
            pedidos.forEach(pedido => { 
                /*
                fiz esse for aqui pra eviter que o array local fique duplicando os valores, 
                observei que isso ocorre sempre que se altera qualquer valor no firebase,
                ou seja, toda vez que o firebase atualiza, esse método aqui é chamado
                */
                for(let index in this.pedidos){
                    if(this.pedidos[index].key === pedido.key){
                        novo = false; // aqui faz com que o objeto não seja incluso
                        this.utils.mergeObj(pedido.val(), this.pedidos[index]);
                        let indexItem = 0;
                        for(let item of pedido.val().itens){
                            let itemTmp = new ItemPedido();
                            let prodTmp = new Produto();
                            this.utils.mergeObj(item.produto, prodTmp);
                            this.utils.mergeObj(item, itemTmp);
                            this.pedidos[index].itens[indexItem].produto = prodTmp;
                            indexItem++;
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
                    this.pedidos.push(pedidoTmp);
                }
            });
        });
    }

    /*
    função para gravar o pedido no firebase
    */
    gravaPedido(){
        this.pedidos.push(this.pedido); // grava localmente
        let estabKey = this.estabelecimento.key;
        let mesaKey = this.mesa.key;
        let pedidoKey = + new Date(); // tem que rever este id depois ...
        this.db.addPedidoMesa(estabKey, mesaKey, pedidoKey+"", "Cliente Padrao"); // ver uma forma de identificar o cliente
        for(let item of this.pedido.itens){
            this.db.addItemPedido(estabKey, mesaKey, pedidoKey+"", item.produto.key, item.observacao, item.quantidade+"");
        }
        this.resetPedido();
        this.setPedidos();
    }
    
    resetPedido(){
        this.pedido = new Pedido();
    }

    getTotalPedido(){
        let total = 0;
        for(let item of this.pedido.itens){
            total += +item.quantidade * +item.produto.preco;
        }
        return total;
    }
    
    setChecado(check: boolean) {
        this.checado = check;   // atualiza status do checkinservice
    }

    setEstabelecimento(estab: Estabelecimento) {
        this.estabelecimento = estab;
    }

    setMesa(mesa: Mesa) {
        this.mesa = mesa;
    }

    checkOut(){
        //reset mesa
        let stabKey = this.estabelecimento.key;
        let mesaKey = this.mesa.key;
        let mesa = this.db.updateMesa(stabKey, mesaKey, "livre");
        this.mesa = new Mesa();
        // reset pedido
        this.pedido = new Pedido();
        // reset estab
        this.estabelecimento = new Estabelecimento();
        // marca checado falso
        this.checado = false;
    }

    setPedido(pedido: Pedido) {
        this.pedido = pedido;
    }
    
    

}