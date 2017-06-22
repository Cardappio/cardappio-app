import { Utils } from '../classes/utils';


let utilClass = new Utils();

describe('Testes da classe Utils', function() {
  
  it('Valores radianos devem ser iguais', function() {
    expect(utilClass.degreesToRadians(50)).toBe((50 * Math.PI / 180));
  });



});
