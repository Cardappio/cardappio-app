import { ItemPedido } from './itempedido';

export class Pedido {

    key: string; // Key do pedido
    estabKey: string; // Key do estabelecimento
    mesaKey: string; // Key da mesa
    itens: Array<ItemPedido>;
    status: string;

    constructor(){
        this.key = '';
        this.estabKey = '';
        this.mesaKey = '';
        this.itens = [];
        this.status = '';
    }
}