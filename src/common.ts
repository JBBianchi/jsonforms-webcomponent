import { ErrorObject } from 'ajv';

export interface IWebComponent {
  connectedCallback(): void;
  adoptedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(
    attribute: string,
    previousValue: unknown,
    currentValue: unknown
  ): void;
}

export type EventHandler<T = unknown> = (evt: CustomEvent<T>) => void;

export const noop: EventHandler = (_: CustomEvent): void => {};

export function debounce(fn: Function, delay: number = 100): (...arg: unknown[])=>void {
  let handle: number;
  return function(this: any, ...args: unknown[]) {
    if (handle) {
      clearTimeout(handle);
    }
    handle = window.setTimeout(() => { fn.apply(this, args); }, delay);
  };
} 

export interface ChangeEventArgs {
  data?: any;
  errors: ErrorObject[] | undefined
}

export type KeyOfComponent<TComponent> = keyof Omit<TComponent, keyof HTMLElement>;

export const maxBy = <T>(arr: T[], func: (value: T) => number): T => {
  return arr.reduce((prev, next) => {
    if (!prev) {
      return next;
    }
    const prevScore = func(prev);
    const nextScore = func(next);
    return prevScore >= nextScore ? prev: next;
  }, undefined as any);
};

export const shadowRootMode: ShadowRootMode = process.env.NODE_ENV === 'development' ? 'open' : 'closed';


/**
 * Taken from `@neuroglia/common` - https://github.com/neuroglia-io/js-framework/
 */
/**
 * Returns true if the value is an object but not an array
 * @param value
 * @returns
 */
export const isObject = (value: any): boolean => {
  return !!value && typeof value === 'object' /*&& !Array.isArray(value)*/;
};
/**
 * Represents the options used to convert string to pascal case or camel case
 */
export interface CaseConvertionOptions {
  /** Keep dashes (-) characters */
  keepDashes: boolean;
  /** Capitalize after dashes (-) characters, if kept */
  capitalizeAfterDashes: boolean;
  /** Keep underscores (_) characters */
  keepUnderscores: boolean;
  /** Capitalize after underscores (_) characters, if kept */
  capitalizeAfterUnderscores: boolean;
  /** Keep dots (.) characters */
  keepDots: boolean;
  /** Capitalize after dots (.) characters, if kept */
  capitalizeAfterDots: boolean;
}
const defaultConvertingOptions = {
  keepDashes: false,
  capitalizeAfterDashes: false,
  keepUnderscores: false,
  capitalizeAfterUnderscores: false,
  keepDots: true,
  capitalizeAfterDots: true
} as CaseConvertionOptions;
/**
 * Converts a string to pascal case (PascalCase)
 * @param source string The string to convert to pascal case
 * @param convertionOptions CaseConvertionOptions Defaults: keepDashes: false, capitalizeAfterDashes: false, keepUnderscores: false, capitalizeAfterUnderscores: false, keepDots: true, capitalizeAfterDots: true
 * @returns string The pascal case string
 */
export const pascalCase = (source: string, convertionOptions: CaseConvertionOptions = defaultConvertingOptions): string => {
  if (!source) return '';
  let delimiter = '';
  if (!convertionOptions.keepDashes) {
    source = source.replace(/-+/g, ' ');
  }
  else if (convertionOptions.capitalizeAfterDashes) {
    delimiter += '-';
  }
  if (!convertionOptions.keepUnderscores) {
    source = source.replace(/_+/g, ' ');
  }
  else if (convertionOptions.capitalizeAfterUnderscores) {
    delimiter += '_';
  }
  if (!convertionOptions.keepDots) {
    source = source.replace(/\.+/g, ' ');
  }
  else if (convertionOptions.capitalizeAfterDots) {
    delimiter += '\\.';
  }
  if (delimiter) {
    source = source.replace(
      new RegExp('([' + delimiter + '])+(.)(\\w+)', 'g'),
      (_, $2, $3, $4) => `${$2}${$3.toUpperCase()}${$4.toLowerCase()}`
    )
  }
  return source
    .replace(
      /\s+(.)(\w+)/g,
      (_, $2, $3) => `${$2.toUpperCase()}${$3.toLowerCase()}`
    )
    .replace(/\s/g, '')
    .replace(/\w/, (s) => s.toUpperCase())
    ;
};
/**
 * Converts a string to camel case (camelCase)
 * @param source string The string to convert to camel case
 * @param convertionOptions CaseConvertionOptions Defaults: keepDashes: false, capitalizeAfterDashes: false, keepUnderscores: false, capitalizeAfterUnderscores: false, keepDots: true, capitalizeAfterDots: true
 * @returns string The camel case string
 */
export const camelCase = (source: string, convertionOptions: CaseConvertionOptions = defaultConvertingOptions): string => {
  if (!source) return '';
  return pascalCase(source, convertionOptions)
    .replace(/\w/, (s) => s.toLowerCase())
    ;
};


/**
 * From https://gist.github.com/jsjain/a2ba5d40f20e19f734a53c0aad937fbb
 */
export const isEqual = (first: any, second: any): boolean => {
  if (first === second) {
    return true;
  }
  if ((first === undefined || second === undefined || first === null || second === null)
    && (first || second)) {
    return false;
  }
  const firstType = first?.constructor.name;
  const secondType = second?.constructor.name;
  if (firstType !== secondType) {
    return false;
  }
  if (firstType === 'Array') {
    if (first.length !== second.length) {
      return false;
    }
    let equal = true;
    for (let i = 0; i < first.length; i++) {
      if (!isEqual(first[i], second[i])) {
        equal = false;
        break;
      }
    }
    return equal;
  }
  if (firstType === 'Object') {
    let equal = true;
    const fKeys = Object.keys(first);
    const sKeys = Object.keys(second);
    if (fKeys.length !== sKeys.length) {
      return false;
    }
    for (let i = 0; i < fKeys.length; i++) {
      if (first[fKeys[i]] && second[fKeys[i]]) {
        if (first[fKeys[i]] === second[fKeys[i]]) {
          continue; // eslint-disable-line
        }
        if (first[fKeys[i]] && (first[fKeys[i]].constructor.name === 'Array'
          || first[fKeys[i]].constructor.name === 'Object')) {
          equal = isEqual(first[fKeys[i]], second[fKeys[i]]);
          if (!equal) {
            break;
          }
        } else if (first[fKeys[i]] !== second[fKeys[i]]) {
          equal = false;
          break;
        }
      } else if ((first[fKeys[i]] && !second[fKeys[i]]) || (!first[fKeys[i]] && second[fKeys[i]])) {
        equal = false;
        break;
      }
    }
    return equal;
  }
  return first === second;
};