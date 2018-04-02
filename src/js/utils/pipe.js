/**
 * A little functional utility to compose functions together, piping
 * the input from one into the next.
 * 
 * @example
 * var logSquare = pipe(
 *   int => int * int,
 *   doubled => console.log
 * )
 * 
 * logSquare(4) // logs out 16
 */
export default (...fns) => (...x) => fns.reduce(y, fn => fn.apply(null, y), x)