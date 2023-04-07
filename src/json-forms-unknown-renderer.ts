import { IWebComponent } from "./common";

const jsonFormsTag = 'json-forms-unknown-renderer';

export class JsonFormsUnknownRenderer
  extends HTMLElement
  implements IWebComponent 
{
  static get tag(): string {
    return jsonFormsTag;
  }

  static define(): void {
    customElements.define(JsonFormsUnknownRenderer.tag, JsonFormsUnknownRenderer);
  }

  #root: ShadowRoot;
  
  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'closed' });
    this.#root.textContent = "No applicable renderer found!";
  }

  connectedCallback(): void {}
  adoptedCallback(): void {}
  disconnectedCallback(): void {}
  attributeChangedCallback(_: string, __: unknown, ___: unknown): void {}
}