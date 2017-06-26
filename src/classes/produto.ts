/*
Autor: Belchior Dameao
Versão: 1.0
Data: 19/06/2017 14:53
Classe que representa o produto dentro do cardapio
*/
export class Produto{
    key: string;
    nome: string;
    preco: number;
    categoria: string;
    imagemUrl: string;
    descricao: string;
    status: string;
    constructor(){
        this.nome = "";
        this.preco = 0;
        this.categoria = "";
        this.imagemUrl = "";
        this.descricao = "";
        this.status = "";
    }
}