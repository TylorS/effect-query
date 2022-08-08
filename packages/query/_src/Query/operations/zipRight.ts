/**
 * Returns a query that models the execution of this query and the specified
 * query sequentially, returning the result of the specified query.
 *
 * @tsplus pipeable-operator effect/query/Query >
 * @tsplus static effect/query/Query.Aspects zipRight
 * @tsplus pipeable effect/query/Query zipRight
 */
export function zipRight<R2, E2, A2>(that: Query<R2, E2, A2>) {
  return <R, E, A>(self: Query<R, E, A>): Query<R | R2, E | E2, A2> =>
    self.zipWith(that, (_, b) => b)
}
