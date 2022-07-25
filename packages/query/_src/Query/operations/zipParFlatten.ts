import type { MergeTuple } from "@tsplus/stdlib/data/Tuple"

/**
 * Returns a query that models the execution of this query and the specified
 * query in parallel, combining their results into a flattened tuple.
 *
 * @tsplus static effect/query/Query.Aspects zipParFlatten
 * @tsplus pipeable effect/query/Query zzipParFlatten
 */
export function zipParFlatten<R2, E2, A2>(that: LazyArg<Query<R2, E2, A2>>) {
  return <R, E, A>(self: Query<R, E, A>): Query<R | R2, E | E2, MergeTuple<A, A2>> =>
    self.zipWithPar(
      that,
      Tuple.mergeTuple
    )
}
