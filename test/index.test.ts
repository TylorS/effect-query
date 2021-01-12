import * as T from "@effect-ts/core/Effect";
import * as MO from "@effect-ts/morphic";
import { literal } from "@effect-ts/core/Function";
import * as DS from "../src/DataSource";
import {
  StandardRequest,
  eqSymbol,
  hashSymbol,
  morphicRequest,
  morphicOpaqueRequest,
} from "../src/Request";

export class GetUserError {
  readonly _tag = literal("GetUserError");
  constructor(readonly error: Error) {}
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
}

export class GetUser extends StandardRequest<GetUserError, User> {
  readonly _tag = "GetUser";

  constructor(readonly userId: string) {
    super();
  }
}

export interface Product {
  productId: string;
  title: string;
  description: string;
}

export class GetProductError {
  readonly _tag = literal("GetProductError");
  constructor(readonly error: Error) {}
}

export class GetProduct extends StandardRequest<GetProductError, Product> {
  readonly _tag = "GetProduct";

  constructor(readonly productId: string) {
    super();
  }
}

export interface GetUserEnv {
  first: string;
  last: string;
}

export const testUserDS = DS.fromFunctionBatchedM("TestUsers")(
  (_: readonly GetUser[]) =>
    T.access((r: GetUserEnv) =>
      _.map((_) => ({
        firstName: `${r.first}: ${_.userId}`,
        lastName: `${r.last}: ${_.userId}`,
        userId: _.userId,
      }))
    )
)["@"](
  DS.provideSome("TestUsersEnvironment", () => ({
    first: "firstName",
    last: "lastName",
  }))
);

export const testProductDS = DS.fromFunctionBatched("TestProducts")<GetProduct>(
  (_) =>
    _.map((_) => ({
      description: `description: ${_.productId}`,
      title: `title: ${_.productId}`,
      productId: _.productId,
    }))
);

console.log(new GetUser("efjnwejfje")[eqSymbol](new GetUser("efjnwejfje")));
console.log(new GetUser("efjnwejfje")[hashSymbol]());
console.log(new GetUser("efjnwejfje")[hashSymbol]());

const Asset_ = MO.make((F) =>
  F.interface({ assetId: F.string(), isin: F.string() }, { name: "Asset" })
);

export interface Asset extends MO.AType<typeof Asset_> {}
export interface AssetE extends MO.EType<typeof Asset_> {}
export const Asset = MO.opaque<AssetE, Asset>()(Asset_);

const GetAsset_ = morphicRequest(
  "GetAsset",
  MO.make((F) =>
    F.interface({ assetId: F.string() }, { name: "GetAssetPayload" })
  ),
  MO.make((F) =>
    F.interface({ message: F.string() }, { name: "GetAssetError" })
  ),
  Asset
);

export interface GetAsset extends ReturnType<typeof GetAsset_> {}

export const GetAsset = morphicOpaqueRequest<GetAsset>()(GetAsset_);

export const assetDS = DS.fromFunctionBatched("AssetDS")(
  (_: readonly GetAsset[]) =>
    _.map((a) => ({
      assetId: a.payload.assetId,
      isin: `isin: ${a.payload.assetId}`,
    }))
);
