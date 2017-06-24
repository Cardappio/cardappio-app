import {Mesa} from './mesa';
import {Cardapio} from './cardapio';
export class Estabelecimento{
    key: string;
    bairro: string;
    cidade: string;
    descricao: string;
    estado: string;
    dias_funcionamento: string;
    horario_abertura: Date;
    horario_fechamento: Date;
    imgURL: string;
    latitude:string;
    longitude: string;
    nome: string;
    numero: string;
    logradouro: string;
    telefone: string;
    tipo: string;
    mesas: Mesa[];
    cardapios: Cardapio[];
    constructor() {
      this.key = ""; this.bairro = ""; this.cidade = ""; this.descricao = ""; this.estado = "";
      this.dias_funcionamento = ""; this.imgURL = ""; this.latitude = ""; this.longitude = "";
      this.nome = ""; this.numero = ""; this.telefone = ""; this.tipo = ""; this.logradouro = "";
      this.mesas = []; this.cardapios = []; this.horario_abertura = new Date(); this.horario_fechamento = new Date();
    }

    getId(){
      return this.key;
    }

    setId(id:any){
      this.key = id;
    }
}