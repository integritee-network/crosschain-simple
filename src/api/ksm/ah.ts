import {
  XcmV3Junction,
  XcmV3JunctionNetworkId,
  XcmV3Junctions,
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
    ksmEnc: (from, amount, to) =>
      api.tx.PolkadotXcm.limited_teleport_assets(
        fromSystemToSibling(
          1001,
          getNativeAsset(1, amount),
          from,
          to,
        ),
      ),
    dotAh: (from, amount, to) =>
      api.tx.PolkadotXcm.transfer_assets(
        fromAssetHubToForeign(
          XcmV3JunctionNetworkId.Polkadot(),
          1000,
          getNativeAsset(1, amount),
          from,
          to,
        ),
      ),
  },
}

const dotInKsmAh: Parameters<typeof XcmVersionedLocation.V4>[0] = {
  parents: 2,
  interior: XcmV3Junctions.X1(
    XcmV3Junction.GlobalConsensus(XcmV3JunctionNetworkId.Polkadot()),
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

const teerInKsmAh: Parameters<typeof XcmVersionedLocation.V4>[0] = {
  parents: 1,
  interior: XcmV3Junctions.X1(
    XcmV3Junction.Parachain(2015),
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

export default [dot, ksm, teer]
