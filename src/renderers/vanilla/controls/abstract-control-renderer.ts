import {
  computeLabel,
  ControlElement,
  JsonFormsState,
  StatePropsOfControl
} from '@jsonforms/core';
import { debounce } from '../../../common';
import { JsonFormsDispatchRenderer } from '../../../json-forms-dispatch-renderer';


export abstract class JsonFormsAbstractControlRenderer<TControlProps extends StatePropsOfControl> extends JsonFormsDispatchRenderer<ControlElement>
{

  protected rendererProperties: TControlProps = null!;
  protected label: string = "";

  constructor() {
    super();
  }

  protected abstract mapToProps(state: JsonFormsState): TControlProps;

  protected override _refresh() {
    if (!this.jsonforms) {
      throw 'The component needs an instance of JsonForms';
    }
    const state = { jsonforms: this.jsonforms };
    const rendererProperties: TControlProps = this.mapToProps(state);
    this.rendererProperties = rendererProperties;
    this.label = computeLabel(
      this.rendererProperties.label,
      !!this.rendererProperties.required,
      !!this.rendererProperties.config?.hideRequiredAsterisk
    );
  }
  
  protected override refresh = debounce(this._refresh);
}