/*
 * Receives a starting sign_id and an unordered array of
 * sign objects.  Returns an array sorted in order always
 * choosing the preferred reading option. 
 */

export function sortSigns(signs, startingID) {
  return new Promise((resolve, reject) => {
    if (Number.isInteger(startingID)) {
      // TODO make a better check
      const signObject = this.signListToObj(signs)
      let current_sign_id = startingID
      let currentNode = signObject[current_sign_id]
      const sortedArray = [{ [current_sign_id]: currentNode }]
      while (signObject[current_sign_id][0]) {
        current_sign_id = signObject[current_sign_id][0]
        currentNode = signObject[current_sign_id]
        sortedArray.push({ [current_sign_id]: currentNode })
      }
      resolve(sortedArray)
    } else {
      reject(new Error('Bad input.'))
    }
  })
}

const signListToObj = signs => {
  const signObject = {}
  for (let i = 0, sign; (sign = signs[i]); i++) {
    if (signObject[sign.sign_id]) {
      signObject[sign.sign_id].push(sign.next_sign_id)
    } else {
      signObject[sign.sign_id] = [sign.next_sign_id]
    }
  }
}
