import {Mesa} from './mesa';
export class Estabelecimento{
    key: string;
    bairro: string;
    cidade: string;
    descricao: string;
    estado: string;
    horario_funcionamento: string;
    imgURL: string;
    latitude:string;
    longitude: string;
    nome: string;
    numero: string;
    logradouro: string;
    telefone: string;
    tipo: string;
    mesas: Mesa[];
    constructor() {
      this.key = ""; this.bairro = ""; this.cidade = ""; this.descricao = ""; this.estado = "";
      this.horario_funcionamento = ""; this.imgURL = ""; this.latitude = ""; this.longitude = "";
      this.nome = ""; this.numero = ""; this.telefone = ""; this.tipo = ""; this.logradouro = "";
      this.mesas = [];
    }

    getId(){
      return this.key;
    }

    setId(id:any){
      this.key = id;
    }
}