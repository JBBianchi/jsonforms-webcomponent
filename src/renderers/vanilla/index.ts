import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
/* Layout */
import { JsonFormsHorizontalLayoutRenderer, horizontalLayoutRendererTester  } from './layout/horizontal-layout-renderer';
import { JsonFormsVerticalLayoutRenderer, verticalLayoutRendererTester  } from './layout/vertical-layout-renderer';
/* Controls */
import { JsonFormTextControlRenderer, textControlRendererTester  } from './controls/text-control-renderer';

/* Layout */
JsonFormsHorizontalLayoutRenderer.define();
JsonFormsVerticalLayoutRenderer.define();
/* Controls */
JsonFormTextControlRenderer.define();

export const renderers: JsonFormsRendererRegistryEntry[] = [
  /* Layout */
  { renderer: JsonFormsHorizontalLayoutRenderer, tester: horizontalLayoutRendererTester },
  { renderer: JsonFormsVerticalLayoutRenderer, tester: verticalLayoutRendererTester },
  /* Controls */
  { renderer: JsonFormTextControlRenderer, tester: textControlRendererTester },
];