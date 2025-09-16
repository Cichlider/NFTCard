import React, { useState } from 'react';
import { create } from 'ipfs-http-client';

// IPFS 配置 - 使用 Infura IPFS 服务
const IPFS_PROJECT_ID = 'YOUR_INFURA_IPFS_PROJECT_ID';
const IPFS_PROJECT_SECRET = 'YOUR_INFURA_IPFS_SECRET';
const auth = 'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64');

// 或者使用公共IPFS节点 (不稳定，建议用于测试)
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// 备用: 本地IPFS节点
// const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });

function MintForm({ contract, account, onMintSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: null
  });
  const [minting, setMinting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      // 创建预览URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadToIPFS = async (data) => {
    try {
      const result = await ipfs.add(JSON.stringify(data));
      return `https://ipfs.io/ipfs/${result.path}`;
    } catch (error) {
      console.error('IPFS上传失败:', error);
      
      // 备用方案：使用 Pinata 或其他IPFS服务
      // 这里简化处理，实际项目中建议使用更稳定的IPFS服务
      throw new Error('IPFS上传失败，请稍后重试');
    }
  };

  const uploadImageToIPFS = async (file) => {
    try {
      const result = await ipfs.add(file);
      return `https://ipfs.io/ipfs/${result.path}`;
    } catch (error) {
      console.error('图片上传到IPFS失败:', error);
      throw new Error('图片上传失败，请稍后重试');
    }
  };

  const generateDefaultAvatar = (name) => {
    // 生成简单的默认头像 (SVG)
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const bgColor = colors[name.length % colors.length];
    
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${bgColor}"/>
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" 
              font-weight="bold" text-anchor="middle" fill="white">
          ${initials}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('请填写完整的名片信息');
      return;
    }

    try {
      setMinting(true);

      // 1. 处理头像
      let imageUrl;
      if (formData.avatar) {
        // 上传用户选择的头像到IPFS
        imageUrl = await uploadImageToIPFS(formData.avatar);
      } else {
        // 使用默认头像
        imageUrl = generateDefaultAvatar(formData.name);
      }

      // 2. 创建NFT元数据
      const metadata = {
        name: `${formData.name} 的名片`,
        description: formData.description,
        image: imageUrl,
        attributes: [
          {
            trait_type: "创建者",
            value: formData.name
          },
          {
            trait_type: "创建时间",
            value: new Date().toISOString()
          },
          {
            trait_type: "类型",
            value: "NFT名片"
          }
        ],
        external_url: window.location.origin,
        creator: account
      };

      // 3. 上传元数据到IPFS
      console.log('上传元数据到IPFS...');
      const tokenURI = await uploadToIPFS(metadata);
      console.log('元数据URI:', tokenURI);

      // 4. 调用合约铸造NFT
      console.log('铸造NFT...');
      const tx = await contract.mintCard(
        account,
        formData.name,
        formData.description,
        tokenURI
      );

      console.log('交易已发送:', tx.hash);
      alert('交易已发送，等待确认中...');

      // 等待交易确认
      const receipt = await tx.wait();
      console.log('交易已确认:', receipt);

      // 从事件中获取tokenId
      const event = receipt.events?.find(e => e.event === 'CardMinted');
      const tokenId = event?.args?.tokenId;

      alert(`NFT铸造成功! Token ID: ${tokenId}`);

      // 重置表单
      setFormData({ name: '', description: '', avatar: null });
      setPreviewUrl(null);
      
      // 通知父组件更新数据
      onMintSuccess();

    } catch (error) {
      console.error('铸造失败:', error);
      alert('铸造失败: ' + (error.message || '未知错误'));
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="mint-form">
      <h2>✨ 创建你的NFT名片</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">姓名 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="输入你的姓名"
            maxLength={50}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">自我介绍 *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="介绍一下你自己..."
            maxLength={500}
            rows={4}
            required
          />
          <small>{formData.description.length}/500 字符</small>
        </div>

        <div className="form-group">
          <label htmlFor="avatar">头像 (可选)</label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={handleFileChange}
          />
          <small>支持 JPG, PNG, GIF 格式，建议尺寸 200x200px</small>
          
          {previewUrl && (
            <div className="avatar-preview">
              <img src={previewUrl} alt="头像预览" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={minting}
            className="mint-button"
          >
            {minting ? '🔄 铸造中...' : '🎨 铸造NFT名片'}
          </button>
        </div>
      </form>

      {minting && (
        <div className="minting-status">
          <div className="spinner"></div>
          <p>正在铸造你的NFT名片，请耐心等待...</p>
          <small>这可能需要几分钟时间</small>
        </div>
      )}

      <div className="info-box">
        <h4>💡 温馨提示</h4>
        <ul>
          <li>每次铸造需要支付少量的Gas费用</li>
          <li>NFT一旦铸造成功，信息将永久保存在区块链上</li>
          <li>你可以在"我的名片"中查看已铸造的NFT</li>
          <li>如果没有上传头像，系统会为你生成默认头像</li>
        </ul>
      </div>
    </div>
  );
}

export default MintForm;