import {Produto} from './produto';

/*
Autor: Belchior Dameao
Versão: 1.0
Data: 19/06/2017 14:53
Classe que representa o cardápio
*/
export class Cardapio{
    produtos: Array<Produto>;
    constructor(){
        this.produtos = [];
    }
}