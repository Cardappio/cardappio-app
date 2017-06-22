import { Utils } from '../classes/utils';


let utilClass = new Utils();

describe('Testes da classe Utils', function() {
  
  it('Valores radianos devem ser iguais', function() {
    expect(utilClass.degreesToRadians(50)).toBe((50 * Math.PI / 180));
  });



});

//Que o teste acima da erro, olhe o Prompt de comando para ver o erro.
//P.S.: Os erros são executados em realtime, então se você corrigir acima
//a linha de comando já apresentará o resultado.