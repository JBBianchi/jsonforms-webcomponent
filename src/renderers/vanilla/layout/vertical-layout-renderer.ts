import {
  RankedTester,
  rankWith,
  uiTypeIs,
  VerticalLayout
} from '@jsonforms/core';
import { JsonFormsAbstractLayoutRenderer } from './abstract-layout-renderer';

const jsonFormsTag = 'json-forms-vertical-layout-renderer';

export class JsonFormsVerticalLayoutRenderer extends JsonFormsAbstractLayoutRenderer<VerticalLayout>
{
  static get tag(): string {
    return jsonFormsTag;
  }

  static define(): void {
    customElements.define(JsonFormsVerticalLayoutRenderer.tag, JsonFormsVerticalLayoutRenderer);
  }

  protected override direction: string = "column";

  constructor() {
    super();
  }

}

export const verticalLayoutTester: RankedTester = rankWith(
  1,
  uiTypeIs('VerticalLayout')
);