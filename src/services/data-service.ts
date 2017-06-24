import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Injectable()
export class DataService {

    db: AngularFireDatabase;
    mesas: FirebaseListObservable<any>;
    limitlista: number = 10;

    constructor(dB: AngularFireDatabase) {
        this.db = dB;
    }

    setLimit(limit : number){
        this.limitlista = limit;
    }

    /*
    * Retorna todos as Redes.
    */
    getRedes(): FirebaseListObservable<any> {
        return this.db.list('/redes', { 
            preserveSnapshot: true,
            query: {
                limitToFirst: this.limitlista // limitação da lista
            }
        });
    }

    /*
    * Retorna os estabelecimentos de uma rede.
    */
    getEstabelecimentos(idrede: string){
        return this.db.list('/estabelecimentos/'+idrede, { preserveSnapshot: true });
    }
    
    /*
    * Retorna um estabelecimento.
    */
    getEstabelecimento(idrede: string, idestab: string){
        return this.db.object('/estabelecimentos/'+idrede+'/'+idestab, { preserveSnapshot: true});
    }

    /*
    * Retorna as mesas de um estabelecimento
    */
    getMesas(idestab: string){
        return this.db.list('/mesas/'+idestab, { preserveSnapshot: true ,
            query: {
                limitToFirst: this.limitlista // limitação da lista
            }});
    }

    /*
     * Retorna Mesa com base em um Id
     */
    getMesa(estabKey: string, mesaKey: string) {
        return this.db.object('/mesas/'+estabKey+'/'+mesaKey);
    }

    /*
     * Retorna Cardápio de um estabelecimento
     */
    getCardapio(estabKey: string) {
        return this.db.list('/cardapios/'+estabKey, { preserveSnapshot: true });
    }

    /*
     * Retorna Itens de um cardápio
     */
    getItensCardapio(estabKey, categoriaKey) {
        return this.db.list('cardapios/'+estabKey+'/'+categoriaKey, { preserveSnapshot: true });
    }

    /*
     * Retorna um Produto de uma categoria de cardápio de um Estabelecimento
     */
    getProduto(estabKey: string, catKey: string, prodKey: string) {
        return this.db.object('cardapios/'+estabKey+'/'+catKey+'/'+prodKey);
    }

    /* 
     * Retorna Categoria de Cardápio pelo id da categoria
     */
    getCategoriaCardapio(categoriaKey: string) {
        return this.db.object('/categorias_cardapio/'+categoriaKey);
    }

    /*
     * Retorna Pedido de uma mesa de um estabelecimento
     */
    getPedidosMesa(estabKey: string, mesaKey: string) {
        return this.db.list('/pedidos/'+estabKey+'/'+mesaKey, { preserveSnapshot: true });
    }

    /*
     * Retorna produtos de um pedido em uma mesa
     */
    getProdutosPedido(estabKey: string, mesaKey: string, pedidoKey: string) {
        return this.db.list('/pedidos/'+estabKey+'/'+mesaKey+'/'+pedidoKey+'/itens/', { preserveSnapshot: true });
    }

    /*
    * adiciona uma mesa a um estabelecimento
    */
    addMesa(numero:string, idestab: string){
        this.mesas = this.db.list('/estabelecimentos/'+idestab+'/mesas');
        this.mesas.push({
            numero: numero,
            status: "livre"
         });
    }

    /*
    * Atualizar status de uma mesa
    */
    updateMesa(idestab: string, idmesa: string, status: string){
        this.db.object('/mesas/'+idestab+'/'+idmesa).update({ status: status });
    }

    

}