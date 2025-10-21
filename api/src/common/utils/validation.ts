import { ValidationError } from "class-validator";
import { ValidationGraphQLException } from "../exceptions";

export interface ValidationErrorInfo {
    field: string;
    message: string;
    constraints: { [type: string]: string };
}

export function getValidationErrors(errors: ValidationError[]): ValidationErrorInfo[] {
    if (!errors || errors.length === 0) {
        return [];
    }

    const errorList: ValidationErrorInfo[] = [];

    function extractError(error: ValidationError, parentPath: string = '') {
        const currentPath = parentPath ? `${parentPath}.${error.property}` : error.property;

        if (error.constraints) {
            errorList.push({
                field: currentPath,
                message: Object.values(error.constraints)[0], // get first error
                constraints: error.constraints,
            });
        }

        // recursive process children
        if (error.children && error.children.length > 0) {
            error.children.forEach(childError => {
                extractError(childError, currentPath);
            });
        }
    }

    errors.forEach(error => extractError(error));
    return errorList;
}

export interface FormatValidationError {
    isValid: boolean;
    errors: string[];
    firstError?: string;
}

export function formatValidationErrors(errors: ValidationError[]): FormatValidationError {
    if (errors.length === 0) {
        return { isValid: true, errors: [] }
    }

    const validationErrors = getValidationErrors(errors);

    return {
        isValid: false,
        errors: validationErrors.map(err => `${err.message}`),
        firstError: validationErrors.length > 0 ? `${validationErrors[0].message}` : undefined,
    };
}

export function throwIfDtoValidateFail(errors: ValidationError[]) {
    const formatted = formatValidationErrors(errors);
    if (!formatted.isValid) {
        // todo 现在只返回第一个错误字段，并且后面的日志也记录第一个
        throw new ValidationGraphQLException(formatted.firstError);
    }
}
