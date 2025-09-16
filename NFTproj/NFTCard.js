import React, { useState, useEffect } from 'react';

function NFTCard({ nft, showOwner = false }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetadata();
  }, [nft.tokenURI]);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      setError(null);

      if (nft.tokenURI) {
        // 尝试从IPFS加载元数据
        let url = nft.tokenURI;
        
        // 如果是IPFS链接，尝试多个网关
        if (url.startsWith('ipfs://')) {
          const hash = url.replace('ipfs://', '');
          url = `https://ipfs.io/ipfs/${hash}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setMetadata(data);
      }
    } catch (err) {
      console.error('加载元数据失败:', err);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    }).catch(() => {
      alert('复制失败');
    });
  };

  const openInExplorer = () => {
    // 这里可以根据网络打开对应的区块链浏览器
    // 示例使用 Etherscan
    const baseUrl = 'https://sepolia.etherscan.io'; // 测试网
    window.open(`${baseUrl}/token/${nft.contractAddress}?a=${nft.tokenId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="nft-card loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-card error">
        <div className="error-icon">❌</div>
        <h3>Token #{nft.tokenId}</h3>
        <p className="error-text">{error}</p>
        <div className="card-info">
          <p><strong>创建者:</strong> {nft.name}</p>
          <p><strong>描述:</strong> {nft.description}</p>
          {showOwner && nft.owner && (
            <p><strong>拥有者:</strong> {formatAddress(nft.owner)}</p>
          )}
          <p><strong>创建时间:</strong> {formatDate(nft.createdAt)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-card">
      <div className="card-header">
        <span className="token-id">#{nft.tokenId}</span>
        <button 
          className="more-button"
          onClick={openInExplorer}
          title="在区块链浏览器中查看"
        >
          🔗
        </button>
      </div>

      <div className="card-image">
        {metadata?.image ? (
          <img 
            src={metadata.image.startsWith('data:') 
              ? metadata.image 
              : metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
            alt={metadata.name || nft.name}
            onError={(e) => {
              // 如果图片加载失败，显示默认头像
              e.target.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="#ddd"/>
                  <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" 
                        text-anchor="middle" fill="#999">
                    ${nft.name?.[0] || '?'}
                  </text>
                </svg>
              `)}`;
            }}
          />
        ) : (
          <div className="default-avatar">
            <span>{nft.name?.[0] || '?'}</span>
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-title">{metadata?.name || `${nft.name} 的名片`}</h3>
        <p className="card-description">
          {metadata?.description || nft.description}
        </p>

        <div className="card-details">
          <div className="detail-item">
            <span className="label">创建者:</span>
            <span 
              className="value clickable" 
              onClick={() => copyToClipboard(nft.creator)}
              title="点击复制地址"
            >
              {nft.name}
            </span>
          </div>

          {showOwner && nft.owner && nft.owner !== nft.creator && (
            <div className="detail-item">
              <span className="label">拥有者:</span>
              <span 
                className="value clickable"
                onClick={() => copyToClipboard(nft.owner)}
                title="点击复制地址"
              >
                {formatAddress(nft.owner)}
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="label">创建时间:</span>
            <span className="value">{formatDate(nft.createdAt)}</span>
          </div>
        </div>

        {metadata?.attributes && (
          <div className="card-attributes">
            <h4>属性</h4>
            <div className="attributes-grid">
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="attribute">
                  <span className="attr-name">{attr.trait_type}</span>
                  <span className="attr-value">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button 
          className="action-button"
          onClick={() => copyToClipboard(nft.tokenURI)}
          title="复制元数据链接"
        >
          📋 复制链接
        </button>
        <button 
          className="action-button"
          onClick={openInExplorer}
          title="在区块链浏览器中查看"
        >
          🔍 查看详情
        </button>
      </div>
    </div>
  );
}

export default NFTCard;