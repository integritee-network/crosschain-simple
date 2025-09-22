import {
  XcmV5Junction,
  XcmV5NetworkId,
  XcmV5Junctions,
  XcmVersionedLocation,
  XcmVersionedAssets,
  XcmV3MultiassetFungibility,
  ksmAh,
} from "@polkadot-api/descriptors"
import { ksmAhClient } from "@/api/clients"
import { AssetInChain } from "../types"
import {
  fromAssetHubToForeign,
  fromAssetHubToRelay, fromSystemToSibling,
  getNativeAsset,
  watchAccoutFreeBalance,
  watchForeingAssetAccoutFreeBalance,
} from "../common"

const api = ksmAhClient.getTypedApi(ksmAh)
const ed = api.constants.Balances.ExistentialDeposit()
console.log("KAH ed", ed.toString())
const myfn = watchAccoutFreeBalance(api)
console.log("KAH myfn", myfn)
const ksm: AssetInChain = {
  chain: "ksmAh",
  symbol: "KSM",
  watchFreeBalance: watchAccoutFreeBalance(api),
  watchPorteerStatus: null,
  teleport: {
    ksm: (...args) =>
      api.tx.PolkadotXcm.transfer_assets(fromAssetHubToRelay(...args)),
    dotAh: (from, amount, to) =>
      api.tx.PolkadotXcm.transfer_assets(
        fromAssetHubToForeign(
          XcmV5NetworkId.Polkadot(),
          1000,
          getNativeAsset(1, amount),
          from,
          to,
        ),
      ),
  },
}

const dotInKsmAh: Parameters<typeof XcmVersionedLocation.V5>[0] = {
  parents: 2,
  interior: XcmV5Junctions.X1(
    XcmV5Junction.GlobalConsensus(XcmV5NetworkId.Polkadot()),
  ),
}

const dot: AssetInChain = {
  chain: "ksmAh",
  symbol: "DOT",
  watchFreeBalance: watchForeingAssetAccoutFreeBalance(api, dotInKsmAh),
  watchPorteerStatus: null,
  teleport: {
    /*
    dotAh: (from, amount, to) =>
      api.tx.PolkadotXcm.limited_reserve_transfer_assets(
        fromAssetHubToForeign(
          XcmV4JunctionNetworkId.Polkadot(),
          1000,
          XcmVersionedAssets.V4([
            {
              id: dotInKsmAh,
              fun: XcmV3MultiassetFungibility.Fungible(amount),
            },
          ]),
          from,
          to,
        ),
      ),
    */
  },
}

const teerInKsmAh: Parameters<typeof XcmVersionedLocation.V5>[0] = {
  parents: 1,
  interior: XcmV5Junctions.X1(
    XcmV5Junction.Parachain(2015),
  ),
}

const teer: AssetInChain = {
  chain: "ksmAh",
  symbol: "TEER",
  watchFreeBalance: watchForeingAssetAccoutFreeBalance(api, teerInKsmAh),
  watchPorteerStatus: null,
  teleport: {
    itk: (from, amount, to) =>
      api.tx.PolkadotXcm.transfer_assets(
        fromSystemToSibling(
          2015,
          XcmVersionedAssets.V4([
            {
              id: teerInKsmAh,
              fun: XcmV3MultiassetFungibility.Fungible(amount),
            },
          ]),
          from,
          to,
        ),
      ),
    /*
    dotAh: (from, amount, to) =>
      api.tx.PolkadotXcm.limited_reserve_transfer_assets(
        fromAssetHubToForeign(
          XcmV4JunctionNetworkId.Polkadot(),
          1000,
          XcmVersionedAssets.V4([
            {
              id: teerInKsmAh,
              fun: XcmV3MultiassetFungibility.Fungible(amount),
            },
          ]),
          from,
          to,
        ),
      ),
    */
  },
}

export default [teer, dot, ksm]
