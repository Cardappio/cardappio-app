/*
Autor: Belchior Dameao
Versão: 1.0
Data: 19/06/2017 14:53
Classe que representa o cardápio
*/

import {Produto} from './produto';
import {CategoriaCardapio} from './categoriacardapio';
export class Cardapio{
    produtos: Produto[];
    categoria: CategoriaCardapio;
    constructor(){
        this.produtos = [];
        this.categoria = new CategoriaCardapio();
    }
}