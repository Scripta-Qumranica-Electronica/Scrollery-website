/**
 * Create an Html Element from a string
 * 
 * @param {string} html representing one or more elements
 * @return {Element}    a <div> with childNodes representing the elements passed in
 */
export default html => {
  var div = document.createElement('div');
  div.innerHTML = html.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div; 
}
