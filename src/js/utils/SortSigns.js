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
  return (!current.next_sign_id || !hash[current.next_sign_id])
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

  // ensure hash is same length as signs passed in
  // if (Object.keys(hash).length !== signs.length) {
  //   throw new Error(`sign stream has ${signs.length} signs,
  //    hash has ${Object.keys(hash).length} and cannot be processed`);
  // }

  // get the first sign ...i.e., the one without a previous sign 
  // designated or available in the hash.
  let start = signs.find(sign => (!sign.prev_sign_id || !hash[sign.prev_sign_id]))
  
  // ensure a start is found
  if (!start) {
    return signs;
  }

  // call and return from recursive appendNext
  let sorted = []
  try {
    sorted = appendNext(sorted, hash, start)
  } catch (err) {
    console.error("sign stream is invalid and cannot be sorted")
    throw err
  }
  return sorted

}

/**
 * @typedef {function}
 * 
 * @param {array.<object>} signs An array of raw sign objects that can be merged 
 */
export default sort