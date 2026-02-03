import { InterfaceDefinition, ModuleClassScanner } from "../src/core/classes/module-loader.js";

abstract class AnimalBase {
  abstract speak(): string;

  move(): void {
    console.log('Moving...');
  }
}

class Dog extends AnimalBase {
  speak(): string {
    return 'Woof!';
  }

  bark(): void {
    console.log('Barking');
  }
}

const ANIMAL_BASE_SYMBOL = Symbol.for('animal.base');

class Cat extends AnimalBase {
  static [ANIMAL_BASE_SYMBOL] = true;
  speak(): string {
    return "Meow!";
  }

  purr(): void {
    console.log('Purring...');
  }
}

const CAR_SYMBOL = Symbol.for('car');

class Car {
  static [CAR_SYMBOL] = true;
  drive(): void {
    console.log('Driving...');
  }
}

function Injectable(target: any) {
  target.injectable = true;
}

function Controller(path: string) {
  return function (target: any) {
    target.controllerPath = path;
  };
}

@Injectable
@Controller('/api')
class ApiService {
  getData(): string {
    return 'data';
  }
}

@Injectable
class LoggerService {
  log(message: string): void {
    console.log(message);
  }
}

// 模拟模块对象
const mockModule = {
  Dog,
  Cat,
  Car,
  ApiService,
  LoggerService,
  AnimalBase,
  default: Car, // 默认导出
  someFunction: () => 'not a class',
  someValue: 123
};

// 模拟接口定义
interface TestInterface {
  speak(): string;
  move(): void;
}

const testInterfaces: InterfaceDefinition = {
  speak: 'function',
  move: 'function',
};


describe('ModuleClassScanner', () => {
  beforeAll(() => {
    jest.mock('./test-module', () => mockModule, { virtual: true });
  });

  describe('isClass', () => {
    it('should correctly identify classes', () => {
      expect(ModuleClassScanner.isClass(Dog)).toBe(true);
      expect(ModuleClassScanner.isClass(Cat)).toBe(true);
      expect(ModuleClassScanner.isClass(AnimalBase)).toBe(true);
    });

    it('should correctly exclude non-classes', () => {
      expect(ModuleClassScanner.isClass({})).toBe(false);
      expect(ModuleClassScanner.isClass(() => { })).toBe(false);
      expect(ModuleClassScanner.isClass(123)).toBe(false);
      expect(ModuleClassScanner.isClass('string')).toBe(false);
      expect(ModuleClassScanner.isClass(null)).toBe(false);
      expect(ModuleClassScanner.isClass(undefined)).toBe(false);
    });
  });

  describe('scanClass', () => {

    it('should scan all classes from the module object', async () => {
      const classes = await ModuleClassScanner.scanClasses(mockModule);
      expect(classes).toHaveLength(7);
      expect(classes.map(c => c.name)).toEqual(
        expect.arrayContaining(['Dog', 'Cat', 'Car', 'ApiService', 'LoggerService', 'AnimalBase', 'Car'])
      );

      const dogClass = classes.find(c => c.name === 'Dog');
      expect(dogClass).toBeDefined();
      expect(dogClass?.exportName).toBe('Dog');
      expect(dogClass?.class).toBe(Dog);
      expect(dogClass?.isDefault).toBe(false);
    });

    it('should handle default export correctly', async () => {
      const classes = await ModuleClassScanner.scanClasses(mockModule);
      const defaultClass = classes.find(c => c.isDefault);
      expect(defaultClass).toBeDefined();
      expect(defaultClass?.name).toBe('Car'); // 默认导出的类名
      expect(defaultClass?.exportName).toBe('default');
      expect(defaultClass?.class).toBe(Car);
    });

    /* // jest intercept Node.js dynamic import() often fails because ES Modules (ESM), even with
     * // virtual: true and the --experimental-vm-modules flag enabled
    it('should dynamically import and scan classes from module path', async () => {
      const classes = await ModuleClassScanner.scanClasses('./test-module');
      expect(classes).toHaveLength(7);
      expect(classes.map(c => c.name)).toEqual(
        expect.arrayContaining(['Dog', 'Cat', 'Car', 'ApiService', 'LoggerService', 'AnimalBase', 'Car'])
      );
    });
    */

    describe('findSubClasses', () => {
      it('should find all direct and indirect subclass of parent class', async () => {
        const subClasses = await ModuleClassScanner.findSubClasses(mockModule, ANIMAL_BASE_SYMBOL);

        expect(subClasses).toHaveLength(2);
        expect(subClasses.map(c => c.name)).toEqual(
          expect.arrayContaining(['Dog', 'Cat'])
        );

        expect(subClasses.find(c => c.name === 'AnimalBase')).toBeUndefined();
        expect(subClasses.find(c => c.name === 'Car')).toBeUndefined();

        const subClassesNop = await ModuleClassScanner.findSubClasses(mockModule, CAR_SYMBOL);
        expect(subClassesNop).toHaveLength(0);
      });
    });
  });

});

