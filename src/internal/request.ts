import * as Debug from "@effect/io/Debug"
import * as Effect from "@effect/io/Effect"
import type * as CompletedRequestMap from "@effect/query/CompletedRequestMap"
import * as completedRequestMap from "@effect/query/internal/completedRequestMap"
import type * as Request from "@effect/query/Request"
import * as Either from "@fp-ts/core/Either"
import * as Data from "@fp-ts/data/Data"

/** @internal */
const RequestSymbolKey = "@effect/query/Request"

/** @internal */
export const RequestTypeId: Request.RequestTypeId = Symbol.for(
  RequestSymbolKey
) as Request.RequestTypeId

/** @internal */
const requestVariance = {
  _E: (_: never) => _,
  _A: (_: never) => _
}

/** @internal */
export const isRequest = (u: unknown): u is Request.Request<unknown, unknown> =>
  typeof u === "object" && u != null && RequestTypeId in u

/** @internal */
export const of = <R extends Request.Request<any, any>>(): Request.Request.Constructor<R> =>
  (args) =>
    // @ts-expect-error
    Data.struct({
      [RequestTypeId]: requestVariance,
      ...args
    })

/** @internal */
export const tagged = <R extends Request.Request<any, any> & { _tag: string }>(
  tag: R["_tag"]
): Request.Request.Constructor<R, "_tag"> =>
  (args) =>
    // @ts-expect-error
    Data.struct({
      [RequestTypeId]: requestVariance,
      _tag: tag,
      ...args
    })

/** @internal */
export const complete = Debug.dual<
  <A extends Request.Request<any, any>>(
    self: A,
    result: Request.Request.Result<A>
  ) => Effect.Effect<CompletedRequestMap.CompletedRequestMap, never, void>,
  <A extends Request.Request<any, any>>(
    result: Request.Request.Result<A>
  ) => (self: A) => Effect.Effect<CompletedRequestMap.CompletedRequestMap, never, void>
>(2, (self, result) =>
  Effect.serviceWith(
    completedRequestMap.Tag,
    (map) => completedRequestMap.set(map, self, result)
  ))

/** @internal */
export const completeEffect = Debug.dual<
  <A extends Request.Request<any, any>, R>(
    self: A,
    effect: Effect.Effect<R, Request.Request.Error<A>, Request.Request.Success<A>>
  ) => Effect.Effect<R | CompletedRequestMap.CompletedRequestMap, never, void>,
  <A extends Request.Request<any, any>, R>(
    effect: Effect.Effect<R, Request.Request.Error<A>, Request.Request.Success<A>>
  ) => (self: A) => Effect.Effect<R | CompletedRequestMap.CompletedRequestMap, never, void>
>(2, (self, effect) =>
  Effect.matchEffect(
    effect,
    // @ts-expect-error
    (error) => complete(self, Either.left(error)),
    // @ts-expect-error
    (value) => complete(self, Either.right(value))
  ))

/** @internal */
export const fail = Debug.dual<
  <A extends Request.Request<any, any>>(
    self: A,
    error: Request.Request.Error<A>
  ) => Effect.Effect<CompletedRequestMap.CompletedRequestMap, never, void>,
  <A extends Request.Request<any, any>>(
    error: Request.Request.Error<A>
  ) => (self: A) => Effect.Effect<CompletedRequestMap.CompletedRequestMap, never, void>
>(2, (self, error) =>
  // @ts-expect-error
  complete(self, Either.left(error)))

/** @internal */
export const succeed = Debug.dual<
  <A extends Request.Request<any, any>>(
    self: A,
    value: Request.Request.Success<A>
  ) => Effect.Effect<CompletedRequestMap.CompletedRequestMap, never, void>,
  <A extends Request.Request<any, any>>(
    value: Request.Request.Success<A>
  ) => (self: A) => Effect.Effect<CompletedRequestMap.CompletedRequestMap, never, void>
>(2, (self, value) =>
  // @ts-expect-error
  complete(self, Either.right(value)))
