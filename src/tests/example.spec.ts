
import {} from 'jasmine';
import { Utils } from '../classes/utils';


let utilClass = new Utils();

describe('Testes da classe Utils', function() {
  
  it('Valores radianos devem ser iguais', function() {
    expect(utilClass.degreesToRadians(50)).toBe((50 * Math.PI / 180));
  });
  
});
describe('Testes da classe Utils', function() {
  
  it('Distancia retornada deve ser maior que 0'), function(){
    expect(utilClass.calcdist(5,10,100,400)).toBeGreaterThan(0);
  }

});
