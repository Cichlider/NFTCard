const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署 NFTCard 合约...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);

    // 获取账户余额
    const balance = await deployer.getBalance();
    console.log("账户余额:", ethers.utils.formatEther(balance), "ETH");

    // 部署合约
    const NFTCard = await ethers.getContractFactory("NFTCard");
    const nftCard = await NFTCard.deploy();

    await nftCard.deployed();

    console.log("NFTCard 合约部署成功!");
    console.log("合约地址:", nftCard.address);
    console.log("部署交易哈希:", nftCard.deployTransaction.hash);

    // 验证合约部署
    console.log("正在验证合约部署...");
    const code = await ethers.provider.getCode(nftCard.address);
    if (code === "0x") {
        console.log("❌ 合约部署失败");
    } else {
        console.log("✅ 合约部署成功验证");
    }

    // 测试基本功能
    console.log("正在测试合约基本功能...");
    try {
        const name = await nftCard.name();
        const symbol = await nftCard.symbol();
        const totalSupply = await nftCard.totalSupply();
        
        console.log("合约名称:", name);
        console.log("合约符号:", symbol);
        console.log("当前总供应量:", totalSupply.toString());
        console.log("✅ 基本功能测试通过");
    } catch (error) {
        console.log("❌ 基本功能测试失败:", error.message);
    }

    // 保存部署信息
    const deployInfo = {
        network: hre.network.name,
        contractAddress: nftCard.address,
        deployerAddress: deployer.address,
        deploymentTime: new Date().toISOString(),
        transactionHash: nftCard.deployTransaction.hash
    };

    console.log("\n=== 部署信息 ===");
    console.log(JSON.stringify(deployInfo, null, 2));

    return nftCard.address;
}

// 处理错误
main()
    .then((address) => {
        console.log(`\n🎉 部署完成! 合约地址: ${address}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });