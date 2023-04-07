import { JsonForms } from './json-forms';
import { JsonFormsDispatchRenderer } from './json-forms-dispatch-renderer';
import { JsonFormsUnknownRenderer } from './json-forms-unknown-renderer';

export const defineComponents = () => {
  JsonForms.define();
  JsonFormsDispatchRenderer.define();
  JsonFormsUnknownRenderer.define();
};