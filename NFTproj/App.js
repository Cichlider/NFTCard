import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MintForm from './components/MintForm';
import NFTCard from './components/NFTCard';
import './App.css';

// 合约ABI (简化版，实际使用时需要完整ABI)
const CONTRACT_ABI = [
  "function mintCard(address to, string name, string description, string tokenURI) returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function getTokensByOwner(address owner) view returns (uint256[])",
  "function getCardInfo(uint256 tokenId) view returns (tuple(address creator, string name, string description, uint256 createdAt))",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event CardMinted(uint256 indexed tokenId, address indexed creator, string name)"
];

// 合约地址 (部署后需要更新)
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mint');

  // 初始化Web3连接
  useEffect(() => {
    initializeWeb3();
  }, []);

  // 当账户连接后，加载NFT数据
  useEffect(() => {
    if (contract && account) {
      loadUserNFTs();
      loadAllNFTs();
    }
  }, [contract, account]);

  const initializeWeb3 = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

      } else {
        alert('请安装 MetaMask!');
      }
    } catch (error) {
      console.error('初始化Web3失败:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!provider) return;

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setSigner(signer);
      setAccount(address);

      // 初始化合约
      if (CONTRACT_ADDRESS !== "YOUR_CONTRACT_ADDRESS_HERE") {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contract);
      }

    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败: ' + error.message);
    }
  };

  const loadUserNFTs = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      const tokenIds = await contract.getTokensByOwner(account);
      const nfts = [];

      for (let tokenId of tokenIds) {
        const cardInfo = await contract.getCardInfo(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        
        nfts.push({
          tokenId: tokenId.toString(),
          name: cardInfo.name,
          description: cardInfo.description,
          creator: cardInfo.creator,
          createdAt: new Date(cardInfo.createdAt * 1000),
          tokenURI: tokenURI
        });
      }

      setUserNFTs(nfts);
    } catch (error) {
      console.error('加载用户NFT失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllNFTs = async () => {
    if (!contract) return;

    try {
      const totalSupply = await contract.totalSupply();
      const nfts = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          const cardInfo = await contract.getCardInfo(i);
          const tokenURI = await contract.tokenURI(i);
          const owner = await contract.ownerOf(i);
          
          nfts.push({
            tokenId: i.toString(),
            name: cardInfo.name,
            description: cardInfo.description,
            creator: cardInfo.creator,
            owner: owner,
            createdAt: new Date(cardInfo.createdAt * 1000),
            tokenURI: tokenURI
          });
        } catch (error) {
          console.error(`加载NFT ${i} 失败:`, error);
        }
      }

      setAllNFTs(nfts.reverse()); // 最新的在前面
    } catch (error) {
      console.error('加载所有NFT失败:', error);
    }
  };

  const handleMintSuccess = () => {
    // 铸造成功后重新加载数据
    loadUserNFTs();
    loadAllNFTs();
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎴 NFT 名片</h1>
        <p>创建属于你的链上数字名片</p>
        
        {!account ? (
          <button onClick={connectWallet} className="connect-button">
            连接钱包
          </button>
        ) : (
          <div className="account-info">
            <p>已连接: {account.slice(0, 6)}...{account.slice(-4)}</p>
          </div>
        )}
      </header>

      {account && (
        <>
          <nav className="tab-nav">
            <button 
              className={activeTab === 'mint' ? 'active' : ''}
              onClick={() => setActiveTab('mint')}
            >
              铸造名片
            </button>
            <button 
              className={activeTab === 'my' ? 'active' : ''}
              onClick={() => setActiveTab('my')}
            >
              我的名片 ({userNFTs.length})
            </button>
            <button 
              className={activeTab === 'all' ? 'active' : ''}
              onClick={() => setActiveTab('all')}
            >
              所有名片 ({allNFTs.length})
            </button>
          </nav>

          <main className="main-content">
            {activeTab === 'mint' && (
              <div className="mint-section">
                {CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE" ? (
                  <div className="warning">
                    <h3>⚠️ 请先部署合约</h3>
                    <p>请先部署智能合约并更新 App.js 中的 CONTRACT_ADDRESS</p>
                  </div>
                ) : (
                  <MintForm 
                    contract={contract} 
                    account={account}
                    onMintSuccess={handleMintSuccess}
                  />
                )}
              </div>
            )}

            {activeTab === 'my' && (
              <div className="nft-grid">
                {loading ? (
                  <div className="loading">加载中...</div>
                ) : userNFTs.length > 0 ? (
                  userNFTs.map(nft => (
                    <NFTCard key={nft.tokenId} nft={nft} showOwner={false} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>还没有NFT名片</h3>
                    <p>点击"铸造名片"创建你的第一张NFT名片吧!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="nft-grid">
                {allNFTs.length > 0 ? (
                  allNFTs.map(nft => (
                    <NFTCard key={nft.tokenId} nft={nft} showOwner={true} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>还没有任何NFT名片</h3>
                    <p>成为第一个创建NFT名片的人!</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;