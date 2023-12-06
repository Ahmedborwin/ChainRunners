import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  hardhat,
  polygonMumbai
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  // [polygonMumbai, mainnet, polygon, optimism, arbitrum, base, zora, hardhat]
  [polygonMumbai, hardhat],
  [
    alchemyProvider({ apiKey: '-mN93uQwSHMo3x3ZqlvVmMC1zXvlHtFd' }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'ChainRunners',
  projectId: '5fe3276a7a868c9c3031329b78f05f9e',
  chains
});


const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  alchemyProvider,
  publicClient
})

export { chains, wagmiConfig };