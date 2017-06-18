import { Estabelecimento } from './estabelecimento';
export class Rede {
    key: string;
    nome: string;
    estabelecimentos: Estabelecimento[];
    constructor(){
        this.key = "";
        this.nome = "";
        this.estabelecimentos = [];
    }

}