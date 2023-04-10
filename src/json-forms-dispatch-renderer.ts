import {
  JsonFormsSubStates,
  JsonSchema,
  StatePropsOfJsonFormsRenderer,
  UISchemaElement,
  createId,
  getConfig,
  isControl,
  mapStateToJsonFormsRendererProps,
  removeId
} from '@jsonforms/core';
import {
  IWebComponent,
  KeyOfComponent,
  camelCase,
  debounce,
  isEqual,
  maxBy,
  shadowRootMode
} from './common';
import { JsonFormsUnknownRenderer } from './json-forms-unknown-renderer';

const areEqual = (prevProps: StatePropsOfJsonFormsRenderer | null | undefined, nextProps: StatePropsOfJsonFormsRenderer | null | undefined) => {
  return prevProps?.renderers?.length === nextProps?.renderers?.length
    && prevProps?.cells?.length === nextProps?.cells?.length
    && prevProps?.uischemas?.length === nextProps?.uischemas?.length
    && prevProps?.schema === nextProps?.schema
    && isEqual(prevProps?.uischema, nextProps?.uischema)
    && prevProps?.path === nextProps?.path;
};

const jsonFormsTag = 'json-forms-dispatch-renderer';

export class JsonFormsDispatchRenderer<TUISchemaElement extends UISchemaElement = UISchemaElement>
  extends HTMLElement
  implements IWebComponent
{
  static get tag(): string {
    return jsonFormsTag;
  }

  static define(): void {
    customElements.define(JsonFormsDispatchRenderer.tag, JsonFormsDispatchRenderer);
  }

  static get observedAttributes(): Array<string> {
    return [
      'jsonforms',
      'schema',
      //'root-schema',
      'uischema',
      'path',
      'enabled',
      //'visible',
      //'renderers',
      //'cells',
      //'config',
    ]
  }

  protected root: ShadowRoot;
  #jsonforms: JsonFormsSubStates = null!; // todo: proper null values (or not) handling
  #rendererProperties: StatePropsOfJsonFormsRenderer = null!; // todo: proper null values (or not) handling
  #id: string = null!; // todo: proper null values (or not) handling
  #schema: JsonSchema = null!; // todo: proper null values (or not) handling
  //#rootSchema: JsonSchema = null!; // todo: proper null values (or not) handling
  #uischema: TUISchemaElement = null!; // todo: proper null values (or not) handling
  #path: string = null!; // todo: proper null values (or not) handling
  #enabled: boolean = null!; // todo: proper null values (or not) handling
  //#visible: boolean = null!; // todo: proper null values (or not) handling
  //#renderers: JsonFormsRendererRegistryEntry[] = null!; // todo: proper null values (or not) handling
  //#cells: JsonFormsCellRendererRegistryEntry[] = null!; // todo: proper null values (or not) handling
  //#config: any = null!; // todo: proper null values (or not) handling

  constructor() {
    super();
    this.root = this.attachShadow({ mode: shadowRootMode }); // keeps track of the shadowRoot even if its closed
  }

  get jsonforms(): JsonFormsSubStates {
    return this.#jsonforms;
  }
  set jsonforms(jsonforms: JsonFormsSubStates) {
    this.#jsonforms = jsonforms;
    this.refresh();
  }

  get schema(): JsonSchema {
    return this.#schema;
  }
  set schema(schema: JsonSchema) {
    this.#schema = schema;
    this.refresh();
  }

  get uischema(): TUISchemaElement {
    return this.#uischema;
  }
  set uischema(uischema: TUISchemaElement) {
    this.#uischema = uischema;
    this.refresh();
  }

  get path(): string {
    return this.#path;
  }
  set path(path: string) {
    this.#path = path;
    this.refresh();
  }

  get enabled(): boolean {
    return this.#enabled;
  }
  set enabled(enabled: boolean) {
    this.#enabled = enabled;
    this.refresh();
  }

  attributeChangedCallback(attribute: string, previousValue: unknown, currentValue: unknown): void {
    if (previousValue === currentValue) {
      return;
    }
    if (!attribute) {
      return;
    }
    const property = camelCase(attribute) as KeyOfComponent<JsonFormsDispatchRenderer>;
    (this as any)[property] = currentValue;
  }

  connectedCallback(): void {
    if (!this.root.isConnected) {
      return;
    }
    if (isControl(this.#uischema)) {
      this.#id = createId(this.#uischema.scope);
    }
    this.refresh();
  }

  disconnectedCallback(): void {
    if (isControl(this.#uischema)) {
      removeId(this.#id);
    }
  }

  adoptedCallback(): void {}

  protected _refresh() {
    if (!this.jsonforms) {
      throw 'The component needs an instance of JsonForms';
    }
    const state = { jsonforms: this.jsonforms};
    const rendererProperties = mapStateToJsonFormsRendererProps(
      state, 
      {
        schema: this.#schema,
        uischema: this.#uischema,
        path: this.#path,
        enabled: this.#enabled,
        //renderers: this.#renderers,
        //cells: this.#cells
      }
    );
    if (areEqual(this.#rendererProperties, rendererProperties)) {
      return;
    }
    this.#rendererProperties = rendererProperties;
    const { renderers } = rendererProperties;
    // if (!renderers?.length) {
    //   throw 'Renderers are required';
    // }
    const schema = this.#schema || rendererProperties.schema;
    if (!schema) {
      throw 'Schema is required';
    }
    const uischema  = this.#uischema  || rendererProperties.uischema ;
    if (!uischema) {
      throw 'UISchema is required';
    }
    const testerContext = {
      rootSchema: rendererProperties.rootSchema,
      config: getConfig(state)
    };
    const rendererEntry = maxBy(renderers??[], renderer => renderer.tester(uischema, schema, testerContext));
    let componentRenderer = JsonFormsUnknownRenderer;
    if (!!rendererEntry && rendererEntry.tester(uischema, schema, testerContext) !== -1) {
      componentRenderer = rendererEntry.renderer;
    }
    this.root.innerHTML = '';
    let componentElement;
    if (componentRenderer.tag) {
      componentElement = document.createElement(componentRenderer.tag);
    }
    else {
      componentElement = new componentRenderer();
    }
    if (componentElement instanceof JsonFormsDispatchRenderer) {
      componentElement.jsonforms = this.jsonforms;
      componentElement.uischema = uischema;
      componentElement.schema = schema;
      componentElement.path = this.path;
    }
    this.root.appendChild(componentElement);
  }

  protected refresh = debounce(this._refresh);

}