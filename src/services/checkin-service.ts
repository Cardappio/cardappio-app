import { Injectable } from '@angular/core';

import { Estabelecimento } from '../classes/estabelecimento';
import { Mesa } from '../classes/mesa';
import { Pedido } from '../classes/pedido';

@Injectable()
export class CheckinService {
    
    private checado: boolean; // Condição se usuário efetuou checj-in ou não
    private estabelecimento: Estabelecimento; // Estabelecimento em que está checado
    private mesa: Mesa; // Mesa em que está checado
    private pedido: Pedido; // Pedido do usuário

    constructor() {
        this.checado = false;
        this.estabelecimento = new Estabelecimento();
        this.mesa = new Mesa();
        this.pedido = new Pedido();
    }

    getChecado() {
        return this.checado;
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

    setChecado(check: boolean) {
        this.checado = check;
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

}