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


function catchEm(promise) {
  return promise.then(data => [null, data])
    .catch(err => [err]);
}


async function getAllPoolsV2(startIterator: number) {

  

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
async function launchPools() {

  
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

async function countEntries() {
  const fs = require('fs');
  let uniswapPoolsV2 = fs.readFileSync("uniswapV2PoolTwo.json");
  let pools = JSON.parse(uniswapPoolsV2);
  console.log(pools.length);

}

async function iterate() {
  const fs = require('fs');
  let uniswapPoolsV2 = fs.readFileSync("uniswapV2PoolsList.json");
  let pools = JSON.parse(uniswapPoolsV2);

  for(let i = 0; i < pools.length; i++) {
    console.log(pools[i].poolIndex);
    
  }
}

async function concatenatePools() {
  const fs = require('fs');

  let first = fs.readFileSync("uniswapV2PoolsOrig.json"); // 0 - 1000
  let second = fs.readFileSync("uniswapV2PoolsExtra.json"); // 1000 - 2000
  let third = fs.readFileSync("uniswapV2Pools.json") // 2000-2547
  let fourth = fs.readFileSync("uniswapV2PoolOne.json") // 2541-3049
  let fifth = fs.readFileSync("uniswapV2PoolsThree.json") // 3000-3530
  let sixth = fs.readFileSync("uniswapV2PoolTwo.json") // 3532 - 52000

  let pools1 = JSON.parse(first);
  let pools2 = JSON.parse(second);
  let pools3 = JSON.parse(third);
  let pools4 = JSON.parse(fourth);
  let pools5 = JSON.parse(fifth);
  let pools6 = JSON.parse(sixth);


  let uniswapV2PoolsList = fs.readFileSync("uniswapV2PoolsList.json");

  let allPools = JSON.parse(uniswapV2PoolsList);

  allPools = allPools.concat(pools1);
  allPools = allPools.concat(pools2);
  allPools = allPools.concat(pools3);
  allPools = allPools.concat(pools4);
  allPools = allPools.concat(pools5);
  allPools = allPools.concat(pools6);
  
  console.log(allPools.length);
  let data = JSON.stringify(allPools);

  fs.writeFileSync("uniswapV2PoolsList.json",data);
  

}

async function generateUniqueTokenList() {

  const fs = require('fs');
  let uniswapV2PoolsList = fs.readFileSync("uniswapV2PoolsList.json");
  let pools = JSON.parse(uniswapV2PoolsList);

  let uniqueTokens: any = [];
  
  
  let hashMap = new Map();
  for(let i = 0; i < uniqueTokens.length; i++) {
    hashMap.set(uniqueTokens[i].address, uniqueTokens[i].name);
  }
  
  for(let i = 0; i < pools.length; i++) {
    if(!hashMap.get(pools[i].token0Address)) {
      let pool = {
        name: pools[i].token0Name,
        address: pools[i].token0Address
      }
      uniqueTokens.push(pool);
      hashMap.set(pools[i].token0Address, pools[i].token0Name);
    }

    if(!hashMap.get(pools[i].token1Address)) {
      let pool = {
        name: pools[i].token1Name,
        address: pools[i].token1Address
      }
      uniqueTokens.push(pool);
      hashMap.set(pools[i].token1Address, pools[i].token1Name);
    }
  }
  console.log(uniqueTokens.length);
  let data = JSON.stringify(uniqueTokens);
  fs.writeFileSync("tokenList.json",data);
}

async function addTokenIndex() {
  const fs = require('fs');
  let tokenList = fs.readFileSync("tokenList.json");
  let tokens = JSON.parse(tokenList);
  console.log(tokens.length);
  let tokensWithIndex: any = [];
  for(let i = 0; i < tokens.length; i++) {
    let token = {
      index: i,
      name: tokens[i].name,
      address: tokens[i].address      
    }
    tokensWithIndex.push(token);
  }
  console.log(tokensWithIndex.length);
  let data = JSON.stringify(tokensWithIndex);
  fs.writeFileSync("tokenList.json",data);
}

async function launchSymbols() {

  
  while(startIterator < 47551) {

    const [err, data] = await catchEm(getTokenSymbols(startIterator));
    if(err) {
      console.log("ERROR!");
      const fs = require('fs');
      let tokenList = fs.readFileSync("tokenList.json");
      let tokens = JSON.parse(tokenList);
      let lastTokenIndex = tokens[tokens.length - 1].index;
      startIterator = lastTokenIndex + 2;
      console.log("startIterator: ", startIterator);
    }
  }
}

async function getTokenSymbols(startIterator: number) {
  const fs = require('fs');
  let tokenList = fs.readFileSync("tokenList.json");
  let tokens = JSON.parse(tokenList);

  let symbol = "";
  for(let i = startIterator; i < tokens.length; i++) {
    let contract = new web3.eth.Contract(minAbi, tokens[i].address);
    try {
      symbol = await contract.methods.symbol().call();
    }
    catch {
      contract = new web3.eth.Contract(minAbiBytes, tokens[i].address);
      symbol = web3.utils.toAscii(await contract.methods.symbol().call());

    }
    console.log(symbol, i);
    let symbolObject = {
      index: tokens[i].index,
      symbol: symbol,
      name: tokens[i].name,
      address: tokens[i].address
    }
    let symbolList = fs.readFileSync("symbolList");
    let symbols = JSON.parse(symbolList);
    symbols.push(symbolObject);
    let data = JSON.stringify(symbols);
    fs.writeFileSync(data, "symbolList.json");
  }
}

//launch();
//countEntries();
//iterate();
//concatenatePools();
//generateUniqueTokenList();
//getTokenSymbols(0);
//addTokenIndex();

