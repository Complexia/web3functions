import { UniswapV2FactoryAbi } from "./abi/uniswapV2FactoryAbi";
import { UniswapV2PoolAbi } from "./abi/uniswapV2PoolAbi";

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const API_KEY = "wzmEqIO1heVL-IrIBEhj6AZj6KqDRgMQ";
const uri = `https://eth-mainnet.alchemyapi.io/v2/${API_KEY}`;
const web3 = createAlchemyWeb3(uri);

let uniswapV2PoolAbiModel = UniswapV2PoolAbi();
let uniswapV2PoolAbi = uniswapV2PoolAbiModel.getAbi();

let uniswapV2FactoryAbiModule = UniswapV2FactoryAbi();
let uniswapV2FactoryAbi = uniswapV2FactoryAbiModule.getAbi();

function catchEm(promise) {
  return promise.then(data => [null, data])
    .catch(err => [err]);
}


async function getAllPoolsV2(startIterator: number) {

  let minAbiBytes = [  
    // balanceOf
    {    
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    //name
    { 
      constant: true, 
      inputs:[],
      name: "name",
      outputs: [{name: "", type: "bytes32"}],
      payable: false, 
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs:[{name: "totalSupply", type: "uint256"}],
      type: "function",
  
    },
    
  
  ];

  let minAbi = [  
    // balanceOf
    {    
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    //name
    { 
      constant: true, 
      inputs:[],
      name: "name",
      outputs: [{name: "", type: "string"}],
      payable: false, 
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs:[{name: "totalSupply", type: "uint256"}],
      type: "function",
  
    },
    {
      name: "symbol",
      outputs: [{ type: "string", name: "out" }],
      inputs: [],
      constant: true,
      payable: false,
      type: "function",
      gas: 753,
    },
    {
      name: "decimals",
      outputs: [{ type: "uint256", name: "out" }],
      inputs: [],
      constant: true,
      payable: false,
      type: "function",
      gas: 783,
    },
    
  
  ];

  let uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  let uniswapV2Factory = new web3.eth.Contract(uniswapV2FactoryAbi, uniswapV2FactoryAddress);
  let allPairsLength = await uniswapV2Factory.methods.allPairsLength().call();
  console.log(allPairsLength);
  let poolArray: any = [];

  

    for(let i = startIterator; i < allPairsLength; i++) {

      let poolAddress = await uniswapV2Factory.methods.allPairs(i).call();
      
      
      let pairContract = new web3.eth.Contract(uniswapV2PoolAbi, poolAddress);
      let token0Address = await pairContract.methods.token0().call();
      let token0Contract = new web3.eth.Contract(minAbi, token0Address);
      
      
      let token0Name = "";
      try {
        token0Name = await token0Contract.methods.name().call();
      }
      catch {
        token0Contract = new web3.eth.Contract(minAbiBytes, token0Address);
        
  
        token0Name = web3.utils.toAscii(await token0Contract.methods.name().call());
        
        
      }
      
      let token1Address = await pairContract.methods.token1().call();
      let token1Contract = new web3.eth.Contract(minAbi, token1Address);
      let token1Name = "";
      try {
        token1Name = await token1Contract.methods.name().call();
      }
      catch {
        token1Contract = new web3.eth.Contract(minAbiBytes, token1Address);
        token1Name = await token1Contract.methods.name().call();
      }
  
  
        let pool = {
          poolIndex: i,
          token0Name: token0Name,
          token1Name: token1Name,
          token0Address: token0Address,
          token1Address: token1Address,
          poolAddress: poolAddress
        }

        
        
        const fs = require('fs');
        let uniswapPoolsV2 = fs.readFileSync("uniswapV2PoolsTwo.json");
        console.log("Are we here?");
        let pools = JSON.parse(uniswapPoolsV2);
        console.log(pools[pools.length - 1].poolIndex);
        pools.push(pool);
        let data = JSON.stringify(pools);
        // write JSON string to a file
        fs.writeFileSync("uniswapV2PoolsTwo.json",data);
        console.log("Pool", i, "pushed into pools json");


        // fs.writeFileSync('uniswapV2Pools.json', data, (err) => {
        //   if (err) {
        //       throw err;
        //   }
        //   console.log("JSON data is saved for pool ", i);
        // });
        
    }

    



}
let startIterator = 2562;
async function launch() {

  
  while(startIterator < 3000) {

    const [err, data] = await catchEm(getAllPoolsV2(startIterator));
    if(err) {
      console.log("ERROR!");
      const fs = require('fs');
      let uniswapPoolsV2 = fs.readFileSync("uniswapV2PoolsTwo.json");
      let pools = JSON.parse(uniswapPoolsV2);
      let lastPoolIndex = pools[pools.length - 1].poolIndex;
      startIterator = lastPoolIndex + 2;
      console.log("startIterator: ", startIterator);
    }
  }
}

launch();


