import { Injectable } from '@angular/core';

import { DataService } from './data-service';
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

    constructor(private db: DataService) {
        this.checado = false;
        this.estabelecimento = new Estabelecimento();
        this.mesa = new Mesa();
        this.pedido = new Pedido();
    }

    getChecado() {
        return this.checado;
    }

    getEstabKey () {
        return this.estabelecimento.key;
    }

    getEstabelecimento() {
        return this.estabelecimento;
    }

    getMesa() {
        return this.mesa;
    }

    getPedido() {
        return this.pedido;
    }

    aprovaCheckin(){
        this.db.updateMesa(this.estabelecimento.key, this.mesa.key, "ocupada");
        this.mesa.status = "ocupada"; // atualiza mesa local
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

    setPedido(pedido: Pedido) {
        this.pedido = pedido;
    }
    /*
    Adiciona um item ao pedido
    */
    addItemPedido(item: ItemPedido){
        this.pedido.itens.push(item);
        let stabKey = this.estabelecimento.key;
        let mesaKey = this.mesa.key;
        let pedKey = this.pedido.key;
        let obs = item.observacao;
        let qty = item.quantidade;
        this.db.addItemPedido(stabKey, mesaKey, pedKey, obs, qty+"");
    }
    

}