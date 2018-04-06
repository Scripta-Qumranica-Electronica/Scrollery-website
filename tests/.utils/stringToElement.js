/**
 * @param {string} html       representing one or more elements
 * @return {DocumentFragment} a document fragment with the elements
 */
export default html => {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content;
}
