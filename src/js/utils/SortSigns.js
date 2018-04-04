/**
 * A recursive method to build up the sorted array by looking 
 * up each "next" sign by it's id from the hash.
 * 
 * @param {array.<object>}  array   An array of raw sign objects, sorted
 * @param {object.<object>} hash    An object where the key is a sign, and the value is the object
 * @param {object}          current The current sign object
 * 
 * @returns {array.<object>}        The sorted signs
 */
const appendNext = (array, hash, current) => {
  array.push(current)
  return !current.next_sign_id
    ? array
    : appendNext(array, hash, hash[current.next_sign_id])
}

/**
 * @todo This is O(n*2); consider using a BST or some other algorithm that could be O(n) or O(log(n))
 * 
 * @param {array.<object>=[]} array   The array of bare sign object
 * 
 * @returns {array.object}         The array of signs, sort
 */
const sort = (signs = []) => {

  // ensure signs given
  if (!signs.length) {
    return signs
  }

  // first, create a hash of all the signs, where the keys
  // are sign ids and the value is the sign
  let hash = {}
  for (let i = (signs.length - 1); i > -1; i--) {
    hash[signs[i]['sign_id']] = signs[i]
  }

  // get the first sign ...i.e., the one with a previous sign
  let start = signs.find(sign => !sign.prev_sign_id)
  let sorted = []

  // call and return from recursive appendNext
  return appendNext(sorted, hash, start)
}

/**
 * @typedef {function}
 * 
 * @param {array.<object>} signs An array of raw sign objects that can be merged 
 */
export default sort