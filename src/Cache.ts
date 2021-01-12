// port of: https://github.com/zio/zio-query/blob/b55364683726cc6611bec80876048ec5290cbcf5/zio-query/shared/src/main/scala/zio/query/Cache.scala
import * as T from "@effect-ts/core/Effect";
import * as REF from "@effect-ts/system/Ref";
import * as O from "@effect-ts/core/Common/Option";
import * as E from "@effect-ts/core/Common/Either";
import * as MAP from "@effect-ts/core/Persistent/HashMap";
import { eqSymbol, hashSymbol, Request } from "./Request";
import { pipe } from "@effect-ts/core/Function";
import { _A, _E } from "@effect-ts/core/Utils";

/**
 * A `Cache` maintains an internal state with a mapping from requests to `Ref`s
 * that will contain the result of those requests when they are executed. This
 * is used internally by the library to provide deduplication and caching of
 * requests.
 */
export interface Cache {
  /**
   * Looks up a request in the cache, failing with the unit value if the
   * request is not in the cache, succeeding with `Ref(None)` if the request is
   * in the cache but has not been executed yet, or `Ref(Some(value))` if the
   * request has been executed.
   */
  get<E, A>(
    request: Request<E, A>
  ): T.IO<void, REF.Ref<O.Option<E.Either<E, A>>>>;
  /**
   * Looks up a request in the cache. If the request is not in the cache
   * returns a `Left` with a `Ref` that can be set with a `Some` to complete
   * the request. If the request is in the cache returns a `Right` with a `Ref`
   * that either contains `Some` with a result if the request has been executed
   * or `None` if the request has not been executed yet.
   */
  lookup<A extends Request<any, any>>(
    request: A
  ): T.UIO<
    E.Either<
      REF.Ref<O.Option<E.Either<_E<A>, _A<A>>>>,
      REF.Ref<O.Option<E.Either<_E<A>, _A<A>>>>
    >
  >;

  /**
   * Inserts a request and a `Ref` that will contain the result of the request
   * when it is executed into the cache.
   */
  put<E, A>(
    request: Request<E, A>,
    result: REF.Ref<O.Option<E.Either<E, A>>>
  ): T.UIO<void>;
}

export const empty = pipe(
  REF.makeRef(
    MAP.make<Request<any, any>, any>({
      equals: (y) => (x) => x[eqSymbol](y),
      hash: (x) => x[hashSymbol](),
    })
  ),
  T.map(makeDefaultCache)
);

function makeDefaultCache(
  state: REF.Ref<MAP.HashMap<Request<any, any>, any>>
): Cache {
  function get<E, A>(
    request: Request<E, A>
  ): T.IO<void, REF.Ref<O.Option<E.Either<E, A>>>> {
    return pipe(
      REF.get(state),
      T.map(MAP.get(request)),
      T.get,
      T.orElseFail(undefined)
    );
  }

  function lookup<E, A>(
    request: Request<E, A>
  ): T.UIO<
    E.Either<
      REF.Ref<O.Option<E.Either<E, A>>>,
      REF.Ref<O.Option<E.Either<E, A>>>
    >
  > {
    type RET = E.Either<
      REF.Ref<O.Option<E.Either<E, A>>>,
      REF.Ref<O.Option<E.Either<E, A>>>
    >;
    return pipe(
      REF.makeRef(O.emptyOf<E.Either<E, A>>()),
      T.chain((ref) =>
        REF.modify_(state, (cache) =>
          pipe(
            cache.get(request),
            O.fold(
              () => [E.left(ref) as RET, cache.set(request, ref)],
              () => [E.right(ref), cache]
            )
          )
        )
      )
    );
  }

  function put<E, A>(
    request: Request<E, A>,
    result: REF.Ref<O.Option<E.Either<E, A>>>
  ): T.UIO<void> {
    return pipe(state, REF.update(MAP.set(request, result)));
  }

  return { get, lookup, put };
}
