import path from "path";
import { pathToFileURL } from "url";

export interface ClassInfo<T extends new (...args: any[]) => any = new (...args: any[]) => any> {
  name: string;
  exportName: string;
  class: T;
  isDefault: boolean;
}

export interface InterfaceDefinition {
  [methodName: string]: any;
}

export type AnyConstructor = new (...args: any[]) => any;

export class ModuleClassScanner {
  /**
   * Scan all classes in module
   */
  static async scanClasses<T extends new (...args: any[]) => any>(
    module: string | Record<string, any>
  ): Promise<ClassInfo<T>[]> {
    let moduleObj: Record<string, any>;

    if (typeof module === 'string') {
      try {
        const resolvedPath = this.resolveModulePath(module);
        moduleObj = await import(resolvedPath);
      } catch (error) {
        throw new Error(`Error import module: ${module}: ${error}`);
      }
    } else {
      moduleObj = module;
    }

    const classes: Array<ClassInfo<T>> = [];

    for (const [exportName, exportValue] of Object.entries(moduleObj)) {
      const isDefault = exportName === 'default';

      if (this.isClass(exportValue)) {
        classes.push({
          name: isDefault ? exportValue.name : exportName,
          exportName,
          class: exportValue as T,
          isDefault
        });
      }
    }

    return classes;
  }


  private static resolveModulePath(importPath: string): string {
    if (importPath.startsWith('file://') || path.isAbsolute(importPath)) {
      return importPath;
    }

    const callerDir = '';
    if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
      importPath = "./" + importPath;
    }

    const absolute = path.resolve(callerDir, importPath);
    return pathToFileURL(absolute).href;
  }

  // check value is class
  static isClass(value: any): value is new (...args: any[]) => any {
    return typeof value === 'function' &&
      /^\s*class\s+/.test(value.toString());
  }

  /**
   * Find class by name
   */
  static async findClass<
    T extends new (...args: any[]) => any
  >(
    module: string | Record<string, any>,
    className: string,
    isExportName: boolean = false,
  ): Promise<ClassInfo<T> | undefined> {
    const allClasses = await this.scanClasses<T>(module);

    return allClasses.find(classInfo => {
      return isExportName
        ? classInfo.exportName === className
        : classInfo.name === className
    });
  }

  /**
   * Find all subclasses inheriting from speficied parent class
   */
  static async findSubClasses<
    T extends AnyConstructor,
  >(
    module: string | Record<string, any>,
    requiredSymbol: symbol,
    includeAbstract: boolean = false,
  ): Promise<Array<ClassInfo<T>>> {
    const allClasses = await this.scanClasses<T>(module);
    return allClasses.filter(({ class: Class }) => {
      if (!Class || typeof Class !== 'function') return false;
      const isSubclass = Boolean((Class as any)[requiredSymbol]);
      if (!includeAbstract) {
        return isSubclass && !this.isAbstractClass(Class);
      }
      return isSubclass;
    });
  }

  static isAbstractClass(Class: any): boolean {
    // TypeScript 抽象类编译后通常会添加检查
    const classString = Class.toString();
    return (
      // 检查构造函数中的抽象类保护
      classString.includes('Cannot instantiate abstract class') ||
      // 检查方法中的抽象方法实现
      classString.includes('Abstract method not implemented') ||
      // 检查 new.target 检查（TypeScript 的抽象类编译后特征）
      (classString.includes('new.target') &&
        classString.includes('abstract class'))
    );
  }

}
