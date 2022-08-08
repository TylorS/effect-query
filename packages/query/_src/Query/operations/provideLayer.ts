import { Result } from "@effect/query/_internal/Result/definition"
import {
  concreteQuery,
  QueryInternal
} from "@effect/query/Query/operations/_internal/QueryInternal"

/**
 * Provides a layer to this query, which translates it to another level.
 *
 * @tsplus static effect/query/Query.Aspects provideLayer
 * @tsplus pipeable effect/query/Query provideLayer
 */
export function provideLayer<R0, E2, R>(layer: Described<Layer<R0, E2, R>>) {
  return <E, A>(self: Query<R, E, A>): Query<R0, E | E2, A> => {
    concreteQuery(self)
    return new QueryInternal<Exclude<R0, Scope>, E | E2, A>(
      Effect.scoped(layer.value.build.exit.flatMap((exit) => {
        switch (exit._tag) {
          case "Failure": {
            return Effect.succeed(Result.fail(exit.cause))
          }
          case "Success": {
            const query = self.provideEnvironment(Described(exit.value, layer.description))
            concreteQuery(query)
            return query.step
          }
        }
      }))
    )
  }
}
