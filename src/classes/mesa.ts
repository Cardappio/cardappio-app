import {Pedido} from './pedido';
export class Mesa{
    key: string;
    numero: string;
    status: string; // ocupada, livre, aguardando, etc
    pedidos: Array<Pedido>;
    constructor() {
      this.numero = ""; this.status = ""; this.key = "";
      this.pedidos = new Array();
    }
    
}