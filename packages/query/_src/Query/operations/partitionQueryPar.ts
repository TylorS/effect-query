import { partitionMap } from "@effect/query/Query/operations/_internal/partitionMap"

/**
 * Performs a query for each element in a collection, collecting the results
 * into a collection of failed results and a collection of successful
 * results. Requests will be executed in parallel and will be batched.
 *
 * @tsplus static effect/query/Query.Ops partitionQueryPar
 */
export function partitionQueryPar<R, E, A, B>(
  as: Collection<A>,
  f: (a: A) => Query<R, E, B>
): Query<R, never, Tuple<[Chunk<E>, Chunk<B>]>> {
  return Query.forEachPar(as, (a) => f(a).either).map((chunk) => partitionMap(chunk, identity))
}
