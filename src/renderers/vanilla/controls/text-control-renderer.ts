import { 
  Actions,
  coreReducer,
  isStringControl,
  JsonFormsState,
  mapStateToControlProps,
  RankedTester,
  rankWith,
  StatePropsOfControl
} from "@jsonforms/core";
import { debounce, emitJsonFormsCoreChange, isObject } from "../../../common";
import { JsonFormsAbstractControlRenderer } from "./abstract-control-renderer";

const jsonFormsTag = 'json-forms-text-control-renderer';

export class JsonFormTextControlRenderer extends JsonFormsAbstractControlRenderer<StatePropsOfControl>
{
  static get tag(): string {
    return jsonFormsTag;
  }

  static define(): void {
    customElements.define(JsonFormTextControlRenderer.tag, JsonFormTextControlRenderer);
  }

  protected input: HTMLInputElement | undefined;
  #boundOnInputChange: EventListener;

  constructor() {
    super();
    this.#boundOnInputChange = this.onInputChange.bind(this); // binds the event listener to this component rather than the input emitting it
  }

  onInputChange(evt: Event) {
    emitJsonFormsCoreChange(
      this.root,
      coreReducer(
        this.jsonforms.core,
        Actions.update(this.rendererProperties.path, () => (evt.target as HTMLInputElement).value)
      )
    );
  }

  protected mapToProps(state: JsonFormsState): StatePropsOfControl {
    return mapStateToControlProps(state, {
      uischema: this.uischema,
      schema: this.schema,
      path: this.path
    });
  }

  protected override _refresh() {
    super._refresh();
    if (!this.rendererProperties.visible) {
      return;
    }
    const input = document.createElement('input');
    if (this.rendererProperties.uischema.options?.format) {
      input.type = this.rendererProperties.uischema.options.format;
    }
    else if (this.schema.format ==='tel' || this.schema.format === 'email') {
      input.type =this.schema.format
    }
    else {
      input.type = 'text';
    }
    input.value = !isObject(this.rendererProperties.data) ? this.rendererProperties.data : JSON.stringify(this.rendererProperties.data);
    input.addEventListener('change', this.#boundOnInputChange);
    this.input?.removeEventListener('change', this.#boundOnInputChange);
    this.input = input; 
    this.root.innerHTML = '';
    this.root.appendChild(input);
  }

  protected override refresh = debounce(this._refresh);
}

export const textControlRendererTester: RankedTester = rankWith(
  1,
  isStringControl
);