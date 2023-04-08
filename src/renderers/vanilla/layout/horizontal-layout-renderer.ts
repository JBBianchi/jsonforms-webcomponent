import {
  RankedTester,
  rankWith,
  uiTypeIs,
  HorizontalLayout
} from '@jsonforms/core';
import { JsonFormsAbstractLayoutRenderer } from './abstract-layout-renderer';

const jsonFormsTag = 'json-forms-horizontal-layout-renderer';

export class JsonFormsHorizontalLayoutRenderer extends JsonFormsAbstractLayoutRenderer<HorizontalLayout>
{
  static get tag(): string {
    return jsonFormsTag;
  }

  static define(): void {
    customElements.define(JsonFormsHorizontalLayoutRenderer.tag, JsonFormsHorizontalLayoutRenderer);
  }

  protected override direction: string = "row";
  protected override extraStyle: string = "justify-content: center; align-items: flex-start; align-content: flex-start;";

  constructor() {
    super();
  }

}

export const horizontalLayoutTester: RankedTester = rankWith(
  1,
  uiTypeIs('HorizontalLayout')
);