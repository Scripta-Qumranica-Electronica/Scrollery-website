import sort from '~/utils/SortSigns.js'

let stream = [
  {
    "sign_id": 1,
    "next_sign_id": 2,
    "prev_sign_id": null
  },
  {
    "sign_id": 2,
    "next_sign_id": 3,
    "prev_sign_id": 1
  },
  {
    "sign_id": 3,
    "next_sign_id": 4,
    "prev_sign_id": 2
  },
  {
    "sign_id": 4,
    "next_sign_id": 5,
    "prev_sign_id": 3
  },
  {
    "sign_id": 5,
    "next_sign_id": null,
    "prev_sign_id": 4
  }
]

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

describe('SortSigns', () => {

  beforeEach(() => {
    stream = shuffle(stream)
  })

  it('should not lose any items', () => {
    stream = sort(stream)
    expect(stream.length).to.equal(5)
  })

  it('should process a shuffled array of objects', () => {
    stream = sort(stream)

    stream.forEach(({sign_id: id}, i) => {
      expect(id).to.equal(i + 1)
    })
  })

})