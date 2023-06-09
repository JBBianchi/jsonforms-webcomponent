import {
  Actions,
  Generate,
  InitActionOptions,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsCore,
  JsonFormsI18nState,
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  JsonSchema,
  UISchemaElement,
  UISchemaTester,
  ValidationMode,
  configReducer,
  coreReducer,
  createAjv,
  i18nReducer,
} from '@jsonforms/core';
import Ajv, { ErrorObject, Options } from 'ajv';
import { 
  ChangeEventArgs,
  EventHandler,
  IWebComponent,
  JsonFormsCoreChangeEventArgs,
  KeyOfComponent,
  camelCase,
  debounce,
  isObject,
  jsonFormsCoreChangeEventName,
  noop,
  shadowRootMode
} from './common';
import { JsonFormsDispatchRenderer } from './json-forms-dispatch-renderer';
import { renderers } from './renderers/vanilla';

const jsonFormsTag = 'json-forms';
const changeEventName = 'change';

/**
 * JsonForms entry point component
 */
export class JsonForms 
  extends HTMLElement
  implements IWebComponent
{
  static get observedAttributes(): Array<string> {
    // attributes naming convention = property as 'kebab-case', except for events
    // e.g.: `validationMode` property becomes `validation-mode` attribute
    return [
      /* required */
      'data',
      'renderers',
      /* optional */
      'schema',
      'uischema',
      'cells',
      'config',
      'readonly',
      'uischemas',
      'validation-mode',
      'ajv', // ajv options instead?
      'i18n',
      'additional-errors',
      /* events */
      'change',
    ];
  }

  static get tag(): string {
    return jsonFormsTag;
  }

  static get changeEventName(): string {
    return changeEventName;
  }
  
  static define(): void {
    customElements.define(JsonForms.tag, JsonForms);
  }

  #root: ShadowRoot;
  #jsonforms: JsonFormsSubStates = null!; // todo: proper null values (or not) handling  
  #rendererElement: JsonFormsDispatchRenderer = null!;

  #data: any;
  #schema: JsonSchema = null!; // todo: proper null values (or not) handling
  #uischema: UISchemaElement = null!; // todo: proper null values (or not) handling
  #renderers: JsonFormsRendererRegistryEntry[] = renderers; // todo: proper null values (or not) handling
  #cells: JsonFormsCellRendererRegistryEntry[] = null!; // todo: proper null values (or not) handling
  #uischemas: { tester: UISchemaTester; uischema: UISchemaElement; }[] = null!; // todo: proper null values (or not) handling
  #readonly: boolean = null!; // todo: proper null values (or not) handling
  #validationMode: ValidationMode = null!; // todo: proper null values (or not) handling
  #ajv: Ajv = null!; // todo: proper null values (or not) handling
  #config: any;
  #i18n: JsonFormsI18nState | undefined;
  #additionalErrors: ErrorObject[] = null!; // todo: proper null values (or not) handling
  onChange: EventHandler<ChangeEventArgs> = noop;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: shadowRootMode }); // keeps track of the shadowRoot even if its closed
    this.#rendererElement = document.createElement(JsonFormsDispatchRenderer.tag) as JsonFormsDispatchRenderer;
    this.#root.appendChild(this.#rendererElement);
    this.addEventListener(jsonFormsCoreChangeEventName, this.onDataChange as EventListener);
    this.validationMode = 'ValidateAndShow';
    this.cells = [];
    this.readonly = false;
    this.uischemas = [];
    const options: Options = {
      schemaId: 'id',
      allErrors: true
    };
    this.ajv = createAjv(options);
  }

  get data(): any {
    return this.#data;
  }
  set data(data: any) {
    if (this.#data !== data) {
      this.#data = data;
      this.#refresh();
    }
  }

  get renderers(): JsonFormsRendererRegistryEntry[] {
    return this.#renderers;
  }
  set renderers(renderers: JsonFormsRendererRegistryEntry[]) {
    if (!renderers?.length || this.#renderers === renderers) {
      return;
    }
    this.#renderers = renderers;
    this.#refresh();
  }

  get schema(): JsonSchema {
    return this.#schema;
  }
  set schema(schema: JsonSchema) {
    if (!schema) {
      const generatorData = isObject(this.#data) ? this.#data : {};
      schema = Generate.jsonSchema(generatorData);
    }
    if (this.#schema === schema) {
      return;
    }
    this.#schema = schema;
    if (!this.#uischema) {
      this.#uischema = Generate.uiSchema(this.#schema);
    }
    this.#refresh();
  }

  get uischema(): UISchemaElement {
    return this.#uischema;
  }
  set uischema(uischema: UISchemaElement) {
    if (!uischema) {
      if (!this.#schema) {
        return;
      }
      uischema = Generate.uiSchema(this.#schema);
    }
    if (this.#uischema === uischema) {
      return;
    }
    this.#uischema = uischema;      
    this.#refresh();
  }

  get cells(): JsonFormsCellRendererRegistryEntry[] {
    return this.#cells;
  }
  set cells(cells: JsonFormsCellRendererRegistryEntry[]) {
    if (this.#cells === cells) {
      return;
    }
    this.#cells = cells;
    this.#refresh();
  }

  get config(): any {
    return this.#config;
  }
  set config(config: any) {
    if (!config || this.#config === config) {
      return;
    }
    this.#config = config;
    if (this.#jsonforms) {
      this.#jsonforms.config = configReducer(
        undefined,
        Actions.setConfig(config)
      );
    }
    this.#refresh();
  }

  get readonly(): boolean {
    return this.#readonly;
  }
  set readonly(readonly: boolean) {
    if (readonly == null || this.#readonly === readonly) {
      return;
    }
    this.#readonly = readonly;
    this.#refresh();
  }
  
  get uischemas(): { tester: UISchemaTester; uischema: UISchemaElement; }[] {
    return this.#uischemas;
  }
  set uischemas(uischemas: { tester: UISchemaTester; uischema: UISchemaElement; }[]) {
    if (!uischemas || this.#uischemas === uischemas) {
      return;
    }
    this.#uischemas = uischemas;
    this.#refresh();
  }

  get validationMode(): ValidationMode {
    return this.#validationMode;
  }
  set validationMode(validationMode: ValidationMode) {
    if (!validationMode || this.#validationMode === validationMode) {
      return;
    }
    this.#validationMode = validationMode;
    this.#refresh();
  }  

  get ajv(): Ajv {
    return this.#ajv;
  }
  set ajv(ajv: Ajv) {
    if (!ajv || this.#ajv === ajv) {
      return;
    }
    this.#ajv = ajv;
    this.#refresh();
  }

  get i18n(): JsonFormsI18nState | undefined {
    return this.#i18n;
  }
  set i18n(i18n: JsonFormsI18nState | undefined) {
    if (!i18n || this.#i18n === i18n) {
      return;
    }
    this.#i18n = i18n;
    if (this.#jsonforms) {
      this.#jsonforms.i18n = configReducer(
        undefined,
        Actions.setConfig(i18n)
      );
    }
    this.#refresh();
  }

  get additionalErrors(): ErrorObject[] {
    return this.#additionalErrors;
  }
  set additionalErrors(additionalErrors: ErrorObject[]) {
    if (!additionalErrors?.length || this.#additionalErrors === additionalErrors) {
      return;
    }
    this.#additionalErrors = additionalErrors;
    this.#refresh();
  }

  attributeChangedCallback(attribute: string, previousValue: any, currentValue: any): void {
    if (previousValue === currentValue) {
      return;
    }
    if (!attribute) {
      return;
    }
    if (attribute === 'change') {
      this.#bindChangeListener(currentValue);
      return;
    }
    const property = camelCase(attribute) as KeyOfComponent<JsonForms>;
    if (typeof currentValue === 'string') {
      try {
        currentValue = JSON.parse(currentValue);
      }
      catch {}
    }
    this[property] = currentValue;
  }

  connectedCallback(): void {
    if (!this.#root.isConnected) {
      return;
    }
    this.#initialize();
    this.#render();
    this.#emitChange();
  }

  disconnectedCallback(): void {
    this.removeEventListener(jsonFormsCoreChangeEventName, this.onDataChange as EventListener);
    if (this.onChange != null && this.onChange !== noop) {
      this.removeEventListener(changeEventName, this.onChange as EventListener);
    }
  }

  adoptedCallback(): void {}

  onDataChange(evt: CustomEvent<JsonFormsCoreChangeEventArgs>) {
    evt.stopPropagation();
    this.#jsonforms.core = evt.detail.core;
    this.#render();
    this.#emitChange();
  }

  #initialize() {
    if (!!this.#jsonforms) {
      return;
    }
    if (!this.#data) {
      throw 'Data is required';
    }
    // if (!this.#renderers) {
    //   throw 'Renderers are required';
    // }
    const data = this.#data;
    const schema = this.#schema ?? Generate.jsonSchema(isObject(data) ? data : {});
    const uischema = this.#uischema ?? Generate.uiSchema(schema);
    const initialCoreState: JsonFormsCore = {
      data,
      schema,
      uischema
    };
    const initActionOptions: InitActionOptions = {
      ajv: this.#ajv,
      validationMode: this.#validationMode,
      additionalErrors: this.#additionalErrors
    };
    this.#jsonforms = {
      core: coreReducer(
        initialCoreState,
        Actions.init(data, schema, uischema, initActionOptions)
      ),
      config: configReducer(undefined, Actions.setConfig(this.#config)),
      i18n: i18nReducer(this.#i18n, Actions.updateI18n(this.#i18n?.locale, this.#i18n?.translate, this.#i18n?.translateError)),
      renderers: this.#renderers,
      cells: this.#cells,
      uischemas: this.#uischemas,
      readonly: this.#readonly
    };
  }

  #_refresh(): void {
    if (!this.#jsonforms) {
      return;
    }
    if (this.#renderers !== this.#jsonforms.renderers) {
      this.#jsonforms.renderers = this.#renderers;
    }
    if (this.#cells !== this.#jsonforms.cells) {
      this.#jsonforms.cells = this.#cells;
    }
    if (this.#readonly !== this.#jsonforms.readonly) {
      this.#jsonforms.readonly = this.#readonly;
    }
    if (this.#uischemas !== this.#jsonforms.uischemas) {
      this.#jsonforms.uischemas = this.#uischemas;
    }
    const data = this.#data;
    const schema = this.#schema ?? Generate.jsonSchema(isObject(data) ? data : {});
    const uischema = this.#uischema ?? Generate.uiSchema(schema);
    const initActionOptions: InitActionOptions = {
      ajv: this.#ajv,
      validationMode: this.#validationMode,
      additionalErrors: this.#additionalErrors
    };
    this.#jsonforms.core = coreReducer(
      this.#jsonforms.core,
      Actions.updateCore(data, schema, uischema, initActionOptions)
    );
  }

  #_render() {
    this.#rendererElement.jsonforms = this.#jsonforms;
  }

  #refresh = debounce(this.#_refresh);
  #render = debounce(this.#_render);

  #emitChange() {
    if (!this.#jsonforms.core) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<ChangeEventArgs>(
        changeEventName,
        {
          detail: {
            data: this.#jsonforms.core.data,
            errors: this.#jsonforms.core.errors
          },          
          bubbles: true,
          cancelable: true
        }
      )
    );
  }

  #bindChangeListener(listener: EventListener | string | null | undefined): void {
    if (!listener) {
      listener = noop as EventListener;
    }
    if (this.onChange === listener) {
      return;
    }
    if (typeof listener !== 'function') {
      if (typeof listener !== 'string') {
        console.warn(`Change event listener is neither a function nor string`);
        return;
      }
      listener = eval(listener).bind(this) as EventListener;
    }
    if (this.onChange !== noop) {
      this.removeEventListener(changeEventName, this.onChange as EventListener);
    }
    this.onChange = listener;
    this.addEventListener(changeEventName, this.onChange as EventListener);
  }

}