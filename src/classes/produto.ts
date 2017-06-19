/*
Autor: Belchior Dameao
Versão: 1.0
Data: 19/06/2017 14:53
Classe que representa o produto dentro do cardapio
*/
export class Produto{
    nome: string;
    preco: number;
    tipo: string;
    imgemUrl: String;
    descricao: String;
    status: String;
    constructor(){
        this.nome = "";
        this.preco = 0;
        this.tipo = "";
        this.imgemUrl = "";
        this.descricao = "";
        this.status = "";
    }
}