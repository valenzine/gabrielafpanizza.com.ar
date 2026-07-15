export const spanishFootnotesPlugin = {
  name: 'spanish-footnotes',
  element: [
    {
      filter: ['h2'],
      visit(node, context) {
        if (node.properties?.id === 'footnote-label') {
          context.setProperty(node, 'children', [{ type: 'text', value: 'Notas' }]);
        }
      }
    },
    {
      filter: ['a'],
      visit(node, context) {
        if (!Object.hasOwn(node.properties ?? {}, 'dataFootnoteBackref')) {
          return;
        }

        const currentLabel = node.properties?.ariaLabel;
        const reference = typeof currentLabel === 'string'
          ? currentLabel.replace(/^Back to reference\s*/, '')
          : '';

        context.setProperty(
          node,
          'ariaLabel',
          reference ? `Volver a la referencia ${reference}` : 'Volver a la referencia'
        );
      }
    }
  ]
};
