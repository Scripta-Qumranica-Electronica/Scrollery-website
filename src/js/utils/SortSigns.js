/**
 * A recursive method to build up the sorted array
 * 
 * @param {array.<object>}  array   An array of raw sign objects, sorted
 * @param {object.<object>} hash    An object where the key is a sign, and the value is the object
 * @param {object}          current The current sign object
 * 
 * @returns {array.<object>}        The sorted signs
 */
const appendNext = (array, hash, current) => {
  array.push(current)
  current = hash[current.next_sign_id]
  return ((!current || !current.next_sign_id)
    ? array
    : appendNext(array, hash, current))
}

/**
 * @todo This is O(n*2); consider using a BST or some other algorithm that could be O(n) or O(log(n))
 * 
 * @param {array.<object>} array   The array of bare sign object
 * 
 * @returns {array.object}         The array of signs, sort
 */
const sort = signs => {
  let hash = {}
  for (let i = (signs.length - 1); i > -1; i--) {
    hash[signs[i]['sign_id']] = signs[i]
  }

  let start = signs.find(sign => !sign.previous_sign_id)
  let sorted = []
  return appendNext(sorted, hash, start)
}

/**
 * @typedef {function}
 * 
 * @param {array.<object>} signs An array of raw sign objects that can be merged 
 */
export default sort