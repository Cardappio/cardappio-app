/*
    Classe com métodos úteis e/ou repetitivos
*/


export class Utils{

  arrayDias = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'];

    /*
    este método pega os dados retornado do firebase e os inclui em um objeto local
    observar que as keys do objeto do firebase tem que ser iguais às keys do nosso objeto local
    limitado a um nivel ou seja, se o conteudo de uma key for outro objeto, necessário chamar novamente
    */
  mergeObj(objOrigem, objDestino){
    for(let key1 in objOrigem){
        for(let key2 in objDestino){
            if(key1 == key2){
                objDestino[key2] = objOrigem[key1]; 
            }
        }
    }
  }

  // Converte Graus para Radiano
  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  // Calcula distância
  calcdist(lat1, lng1, lat2, lng2) {
    var earthRadiusKm = 6371;

    var dLat = this.degreesToRadians(lat2-lat1);
    var dLng = this.degreesToRadians(lng2-lng1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

    // retorno em metros
    return (earthRadiusKm * c * 1000).toFixed(0);
  }

}