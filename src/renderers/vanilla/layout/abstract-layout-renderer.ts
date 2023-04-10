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
  #childrenElements: JsonFormsDispatchRenderer[] = [];

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
    const styleElement = document.createElement('style');
    this.root.appendChild(styleElement);
    styleElement.textContent = this.styleContent;
    const { visible, enabled, uischema, schema, path }: { visible: boolean, enabled: boolean, uischema: UISchemaElement, schema: JsonSchema,  path: string } = rendererProperties;
    if (!visible) {
      return;
    }
    const children = ((uischema as Layout).elements || []).map(uischema => ({
      uischema,
      schema,
      path,
      visible,
      enabled
    }));
    let isNew: boolean;
    for(let i=0, c=children.length; i<c; i++) {
      const child = children[i];
      isNew = false;
      let childRendererElement = (this.#childrenElements||[])[i];
      if (!childRendererElement) {
        childRendererElement = document.createElement(JsonFormsDispatchRenderer.tag) as JsonFormsDispatchRenderer;
        isNew = true;
      }
      childRendererElement.style.cssText = "flex: 1 1 0%;"
      childRendererElement.jsonforms = this.jsonforms;
      childRendererElement.uischema = child.uischema;
      childRendererElement.schema = child.schema;
      childRendererElement.path = child.path;
      childRendererElement.enabled = child.enabled;
      childRendererElement.visible = child.visible;
      if (isNew) {
        this.root.appendChild(childRendererElement);
        this.#childrenElements.push(childRendererElement);
      }
    }
  }

  protected override refresh = debounce(this._refresh);

}