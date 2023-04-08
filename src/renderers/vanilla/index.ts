import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import { JsonFormsHorizontalLayoutRenderer, horizontalLayoutTester  } from './layout/horizontal-layout-renderer';
import { JsonFormsVerticalLayoutRenderer, verticalLayoutTester  } from './layout/vertical-layout-renderer';

JsonFormsHorizontalLayoutRenderer.define();
JsonFormsVerticalLayoutRenderer.define();

export const renderers: JsonFormsRendererRegistryEntry[] = [
  { renderer: JsonFormsHorizontalLayoutRenderer, tester: horizontalLayoutTester },
  { renderer: JsonFormsVerticalLayoutRenderer, tester: verticalLayoutTester }
];