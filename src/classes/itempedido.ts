import { Produto } from './produto';

export class ItemPedido {

    produto: Produto;
    quantidade: number;
    observacao: string;

    constructor(){
        this.produto = new Produto();
        this.quantidade = 0;
        this.observacao = '';
    }

}