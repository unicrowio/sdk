import * as core from './core'
import * as ui from './ui'
import * as wallet from './wallet'
import * as indexer from './indexer'
import * as helpers from './helpers'
import initNetworks from './config/init'

export * from './typing'

export default { core, ui, wallet, indexer, helpers, initNetworks }

// We need uncom,ent this code bellow and comment the code above when generates te documentation (docusaurus/typedoc)

// export * from './core'
// export * as ui from './ui'
// export * from './wallet'
// export * from './indexer'
// export * from './helpers'

// export * from './typing'

// export default { core, ui, wallet, indexer, helpers, config }
