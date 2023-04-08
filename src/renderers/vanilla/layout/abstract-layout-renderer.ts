import { 
  JsonSchema,
  Layout,
  LayoutProps,
  mapStateToLayoutProps,
  UISchemaElement
} from '@jsonforms/core';
import { debounce } from '../../../common';
import { JsonFormsDispatchRenderer } from '../../../json-forms-dispatch-renderer';


export abstract class JsonFormsAbstractLayoutRenderer<TLayout extends Layout = Layout> extends JsonFormsDispatchRenderer<TLayout>
{
 
  protected direction: string = "";
  protected extraStyle: string = "";
  protected get styleContent(): string {
    return `:host {
      width: 100%; 
      display: flex; 
      gap: 16px; 
      flex-direction: ${this.direction}; 
      ${this.extraStyle}
    }
    `;
  }

  constructor() {
    super();
  }

  protected override _refresh() {
    if (!this.jsonforms) {
      throw 'The component needs an instance of JsonForms';
    }
    const state = { jsonforms: this.jsonforms };
    const rendererProperties: LayoutProps = mapStateToLayoutProps(state, {
      uischema: this.uischema,
      schema: this.schema,
      path: this.path
    });
    this.root.innerHTML = '';
    const styleElement = document.createElement('style');
    this.root.appendChild(styleElement);
    styleElement.textContent = this.styleContent;
    const { visible, uischema, schema, path }: { visible: boolean, uischema: UISchemaElement, schema: JsonSchema,  path: string } = rendererProperties;
    if (!visible) {
      return;
    }
    const children = ((uischema as Layout).elements || []).map(element => ({
      uischema: element,
      schema,
      path
    }));
    for(let child of children) {
      const dispatchRendererElement = document.createElement(JsonFormsDispatchRenderer.tag) as JsonFormsDispatchRenderer;
      dispatchRendererElement.style.cssText = "flex: 1 1 0%;"
      dispatchRendererElement.jsonforms = this.jsonforms;
      dispatchRendererElement.uischema = child.uischema;
      dispatchRendererElement.schema = child.schema;
      dispatchRendererElement.path = child.path;
      this.root.appendChild(dispatchRendererElement);
    }
  }

  protected override refresh = debounce(this._refresh);

}