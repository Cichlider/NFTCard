# NFT 名片项目 🎴

一个基于以太坊的链上数字身份名片应用，使用 Solidity + OpenZeppelin ERC-721 + IPFS + React 技术栈构建。

## 🌟 项目特色

- **ERC-721 标准**: 基于 OpenZeppelin 的标准 NFT 合约
- **IPFS 存储**: 元数据和图片分布式存储
- **React 前端**: 现代化的用户界面
- **链上身份**: 永久保存的数字名片

## 📁 项目结构

```
nft-card/
├── contracts/          # Solidity 智能合约
│   └── NFTCard.sol     # 主合约文件
├── scripts/            # 部署脚本
│   └── deploy.js       # Hardhat 部署脚本
├── frontend/           # React 前端应用
│   ├── src/
│   │   ├── App.js      # 主应用组件
│   │   ├── App.css     # 样式文件
│   │   └── components/
│   │       ├── MintForm.js    # 铸造表单
│   │       └── NFTCard.js     # NFT 卡片组件
│   └── package.json    # 前端依赖
├── hardhat.config.js   # Hardhat 配置
├── package.json        # 项目依赖
└── .env               # 环境变量
```

## 🚀 快速开始

### 1. 环境准备

确保你的系统安装了以下工具：

- **Node.js** (v16+)
- **npm** 或 **yarn**
- **Git**

### 2. 安装项目

```bash
# 克隆项目
git clone <your-repo-url>
cd nft-card

# 安装依赖
npm run setup
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的配置
nano .env
```

需要配置的关键变量：

```bash
# 钱包私钥 (用于部署合约)
PRIVATE_KEY=your_wallet_private_key

# RPC 节点 (推荐使用 Infura 或 Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# IPFS 服务 (推荐使用 Infura IPFS)
IPFS_PROJECT_ID=your_infura_ipfs_project_id
IPFS_PROJECT_SECRET=your_infura_ipfs_secret

# 区块链浏览器 API (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 4. 部署合约

#### 本地测试网部署

```bash
# 启动本地 Hardhat 网络
npm run node

# 在新终端中部署合约
npm run deploy:local
```

#### 测试网部署 (推荐 Sepolia)

```bash
# 部署到 Sepolia 测试网
npm run deploy:sepolia

# 部署后会显示合约地址，记录下来
```

#### 合约验证 (可选)

```bash
# 在 Etherscan 上验证合约
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### 5. 配置前端

部署完成后，更新前端配置：

```javascript
// frontend/src/App.js
const CONTRACT_ADDRESS = "你的合约地址";
```

### 6. 启动应用

```bash
# 启动前端开发服务器
npm run dev
```

访问 `http://localhost:3000` 即可使用应用。

## 🔧 开发指南

### 合约开发

```bash
# 编译合约
npm run compile

# 运行测试
npm run test

# 清理构建文件
npm run clean
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

### IPFS 配置

#### 使用 Infura IPFS

1. 注册 [Infura](https://infura.io/) 账户
2. 创建 IPFS 项目
3. 获取项目 ID 和密钥
4. 更新 `.env` 文件

#### 使用 Pinata

```javascript
// 在 MintForm.js 中替换 IPFS 客户端
import pinataSDK from '@pinata/sdk';

const pinata = pinataSDK('your_api_key', 'your_secret_key');
```

#### 使用本地 IPFS 节点

```bash
# 安装 IPFS
# 参考: https://docs.ipfs.io/install/

# 启动 IPFS 守护进程
ipfs daemon

# 更新 MintForm.js 中的 IPFS 配置
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });
```

## 🌐 网络配置

### 支持的网络

- **本地开发**: Hardhat Network (chainId: 1337)
- **以太坊测试网**: Sepolia (chainId: 11155111)
- **Polygon 测试网**: Mumbai (chainId: 80001)
- **以太坊主网**: Mainnet (chainId: 1) - 谨慎使用

### 添加测试网到 MetaMask

#### Sepolia 测试网
- 网络名称: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- Chain ID: 11155111
- 货币符号: ETH
- 区块浏览器: https://sepolia.etherscan.io

#### Polygon Mumbai 测试网
- 网络名称: Mumbai
- RPC URL: https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
- Chain ID: 80001
- 货币符号: MATIC
- 区块浏览器: https://mumbai.polygonscan.com

### 获取测试币

- **Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)
- **Mumbai MATIC**: [Mumbai Faucet](https://faucet.polygon.technology/)

## 🛠 故障排除

### 常见问题

1. **合约部署失败**
   ```bash
   # 检查网络连接和配置
   npx hardhat run scripts/deploy.js --network sepolia
   
   # 查看详细错误信息
   npx hardhat run scripts/deploy.js --network sepolia --verbose
   ```

2. **IPFS 上传失败**
   ```javascript
   // 检查 IPFS 服务配置
   // 尝试使用不同的 IPFS 网关
   const ipfsUrl = metadata.image.replace(
     'ipfs://', 
     'https://gateway.pinata.cloud/ipfs/'
   );
   ```

3. **前端连接问题**
   ```javascript
   // 检查 MetaMask 连接
   if (typeof window.ethereum !== 'undefined') {
     console.log('MetaMask is installed!');
   } else {
     console.log('MetaMask is not installed');
   }
   ```

4. **Gas 费用过高**
   ```javascript
   // 在 hardhat.config.js 中调整 gas 设置
   networks: {
     sepolia: {
       gas: 2100000,
       gasPrice: 20000000000, // 20 gwei
     }
   }
   ```

### 调试技巧

```bash
# 查看合约事件
npx hardhat console --network sepolia

# 在控制台中测试
const contract = await ethers.getContractAt("NFTCard", "CONTRACT_ADDRESS");
const totalSupply = await contract.totalSupply();
console.log("Total Supply:", totalSupply.toString());
```

## 📚 技术文档

### 智能合约 API

```solidity
// 铸造 NFT
function mintCard(
    address to,
    string memory name,
    string memory description,
    string memory tokenURI
) public returns (uint256)

// 获取用户的所有 NFT
function getTokensByOwner(address owner) 
    public view returns (uint256[] memory)

// 获取卡片信息
function getCardInfo(uint256 tokenId) 
    public view returns (CardInfo memory)

// 获取总供应量
function totalSupply() public view returns (uint256)
```

### 前端组件

- **App.js**: 主应用，处理钱包连接和路由
- **MintForm.js**: NFT 铸造表单，处理 IPFS 上传
- **NFTCard.js**: NFT 展示卡片，显示元数据

## 🎨 自定义样式

项目使用了现代化的 CSS 设计，包括：

- 渐变背景和毛玻璃效果
- 响应式网格布局
- 流畅的动画过渡
- 移动端适配

你可以在 `frontend/src/App.css` 中自定义样式。

## 🔐 安全注意事项

1. **私钥安全**: 永远不要将私钥提交到代码仓库
2. **测试网使用**: 在主网部署前充分测试
3. **合约审计**: 主网部署前进行专业审计
4. **权限控制**: 合理设置合约权限

## 📈 扩展功能建议

1. **高级功能**
   - NFT 转移功能
   - 批量铸造
   - 版税设置
   - 属性稀有度

2. **用户体验**
   - 社交分享
   - NFT 市场集成
   - 多语言支持
   - 主题切换

3. **技术优化**
   - Layer 2 支持
   - 元数据缓存
   - 图片优化
   - PWA 支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 支持

如果你在使用过程中遇到问题，可以：

1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 查阅 [Hardhat 文档](https://hardhat.org/docs)
4. 参考 [OpenZeppelin 文档](https://docs.openzeppelin.com/)

---

## 🎉 开始你的 NFT 之旅！

现在你已经有了完整的 NFT 名片项目，可以开始创建属于你的链上数字身份了！

记得先在测试网上充分测试，确认一切正常后再考虑主网部署。祝你的 Web3 项目开发顺利！ 🚀