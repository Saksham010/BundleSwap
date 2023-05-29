pragma solidity 0.8.18;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

interface IERC20{
    // function transferFrom(address sender, address recipient, uint256 amount)external returns(bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address,uint256)external returns(bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

interface IUniswapRouter{
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint amountIn, address[] memory path) view external returns (uint[] memory amounts);

    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);

    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    
}

contract BundleSwap is AutomationCompatibleInterface{
    //Addresses
    address private constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;

    // Pool id
    uint256 internal counter;

    // Create a pool
    struct poolDetail{
        uint256 id;
        uint256 aggregationTime;
        uint256 creationTime;
    }
    // Poolid -> Token 0 and token1
    struct tokenPair{
        address token0;
        address token1;
    }

    // Store user balances
    struct deposits{
        uint256 token0amount;
        uint256 token1amount;
    }

    // Token0 => Token1 => AggregationTime
    mapping(address=>mapping(address => poolDetail)) pool;
    mapping(address=>poolDetail) fromEthpool; //Token2 => poolDetail  (FOR ETH)
    mapping(address => poolDetail) toEthpool; //Token1 => pool detail (TO ETH)
    mapping(uint256=>tokenPair) poolPair; //poolId => tokenpair
    mapping(uint256=>address) fromEthPoolPair; //Poolid -> tokenB
    mapping(uint256 => address) toEthPoolPair; // Pool id -> tokenA

    // User deposits (User -> pool id)
    mapping(address => mapping (uint256 => deposits)) balances; 
    // pool id => User array
    mapping(uint256 => address[]) userList;
    // Pool id => total amount
    mapping(uint256 => uint256) poolBalance;
    // List of active pools id
    uint256[] activePool;

    // Events
    event poolCreated(address,address,uint256);
    event fromEthPoolCreated(address,uint256);
    event toEthPoolCreated(address,uint256);
    event tokenDeposited(uint id,address sender, address tokenIn, address tokenOut, uint256 amount);
    event ethDeposited(uint id, address sender, address tokenOut, uint256 amount);
    event toEthTokenDeposited(uint id, address sender, address tokenIn, uint256 amount);
    event swapReceipt(uint id, address tokenIn, address tokenOut, uint256 inAmount, uint256 outAmount);
    event fromEthSwapReceipt(uint id, address tokenOut, uint256 inAmount, uint256 outAmount);
    event toEthSwapReceipt(uint id, address tokenIn,uint256 inAmount,uint256 outAmount);
    

    //Get pool id 
    function getPoolId(address token0, address token1) public view returns(uint256){
        return pool[token0][token1].id;
    } 

    // Get from eth pool id
    function getEthPoolId(address tokenB) public view returns(uint256){
        return fromEthpool[tokenB].id;
    }
    // Get to eth poolid
    function getToEthPoolId(address tokenA) public view returns(uint256){
        return toEthpool[tokenA].id;
    }

    //Get pool balance 
    function getPoolBalance(uint256 id) public view returns(uint256){
        return poolBalance[id];
    }

    // function to approve token transfer
    function approveToken(address _token,uint256 amount) public {
        bool safe = IERC20(_token).approve(address(this),amount);
        require(safe == true, "Token not approved");
    }


    // Create a new pool
    function createSwapPool(address tokenA, address tokenB,uint256 aggregationTime) internal{
        //Increment counter
        counter++;

        // Create pool
        pool[tokenA][tokenB] = poolDetail(counter,aggregationTime,block.timestamp);

        // Create pool pair
        poolPair[counter] = tokenPair(tokenA,tokenB);

        // Register to list of active pool
        activePool.push(counter);

        // Emit event
        emit poolCreated(tokenA,tokenB,aggregationTime);
    }

    // Create a pool from eth
    function fromEthCreateSwapPool(address tokenB, uint256 aggregationTime) internal{
        //Increment counter
        counter++;

        // Create a pool
        fromEthpool[tokenB] = poolDetail(counter,aggregationTime,block.timestamp);

        // Create a pool pair
        fromEthPoolPair[counter] = tokenB;

        // Register to list of active pools
        activePool.push(counter);

        // Emit event
        emit fromEthPoolCreated(tokenB,aggregationTime);
    }

    // Create a pool to eth
    function toEthCreateSwapPool(address tokenA,uint256 aggregationTime) internal{

        //Increment counter
        counter++;

        // Create a pool
        toEthpool[tokenA] = poolDetail(counter,aggregationTime,block.timestamp);

        // Create a pool pair
        toEthPoolPair[counter] = tokenA;

        // Register to list of active pools
        activePool.push(counter);

        // Emit event
        emit toEthPoolCreated(tokenA,aggregationTime);

    }

    // Register swap request from eth to another token
    function registerSwapFromETHToToken(address tokenB,uint256 amountB, uint256 aggregationTime) payable public{
        // Amount of eth sent to register
        uint256 amountA = msg.value;

        // Check if the pool exists or not
        if(fromEthpool[tokenB].creationTime == 0){
            // If does not exits create a pool
            fromEthCreateSwapPool(tokenB,aggregationTime);
        }
        else{
            // If the pool already exists
            // Check aggregation time
            uint256 timeElapsed = block.timestamp - fromEthpool[tokenB].creationTime;
            require(timeElapsed < fromEthpool[tokenB].aggregationTime, "Cannot deposit after pool time expired. Create a new pool");
        }

        // Pool balance store
        uint256 poolId = getEthPoolId(tokenB);

        // Update the amount of tokens deposited by the user
        balances[msg.sender][poolId].token0amount += amountA;
        balances[msg.sender][poolId].token1amount += amountB;

        // Update user list and pool balance
        registerSender(msg.sender,poolId);
        poolBalance[poolId] += amountA;

        // Emit event of token deposit
        emit ethDeposited(poolId,msg.sender,tokenB,amountA);

    }

    // Regsiter swap request from another token to eth
    function registerSwapFromTokentoEth(address tokenA, uint256 amountA, uint256 aggregationTime) payable public{
        uint256 amountB = msg.value;

        // Check if the pool exits or not
        if(toEthpool[tokenA].creationTime == 0){
            // If does not exits create a pool
            toEthCreateSwapPool(tokenA,aggregationTime);
        }
        else{
            // If the pool already exists
            // Check aggregation time
            uint256 timeElapsed = block.timestamp - toEthpool[tokenA].creationTime;
            require(timeElapsed < toEthpool[tokenA].aggregationTime, "Cannot deposit after pool time expired. Create a new pool");
        }

        // Pool balance store
        uint256 poolId = getToEthPoolId(tokenA);

        // Update the amount of tokens deposited by the user
        balances[msg.sender][poolId].token0amount += amountA;
        balances[msg.sender][poolId].token1amount += amountB;

        // Update user list and pool balance
        registerSender(msg.sender,poolId);
        poolBalance[poolId] += amountA;

        // Emit event of token deposit
        emit toEthTokenDeposited(poolId,msg.sender,tokenA,amountA);

    }

    // Register swap request (TokenA => TokenB)  (Note amount in 18 decimal precision)
    function registerSwap(address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 aggregationTime) public {

        // Sort tokens
        // (address _token0, address _token1) = sort(tokenA,tokenB);
        (address _token0,address _token1) = (tokenA,tokenB);
        
        // Sort amount
        (uint256 _amount0,uint256 _amount1) = (tokenA == _token0)? (amountA,amountB): (amountB,amountA);

        // Check if the pool exists or not
        if(pool[_token0][_token1].creationTime == 0){
            // If does not exist create a pool
            createSwapPool(_token0,_token1,aggregationTime);

        } 
        else{
            // If the pool already exists
            // Check aggregation time
            uint256 timeElapsed = block.timestamp - pool[_token0][_token1].creationTime;
            require(timeElapsed < pool[_token0][_token1].aggregationTime, "Cannot deposit after pool time expired. Create a new pool");
        }

        // Pool balance store
        uint256 poolId = getPoolId(_token0,_token1);    

        // Update the amount of tokens deposited by the user
        balances[msg.sender][poolId].token0amount += _amount0;
        balances[msg.sender][poolId].token1amount += _amount1;

        // Update user list and pool balance
        registerSender(msg.sender,poolId);
        poolBalance[poolId] += _amount0;

        // Transfer Token A to the contract
        bool success = IERC20(_token0).transferFrom(msg.sender,address(this),_amount0);
        require(success == true,"Token0 transfer failed");

        // Emit event
        emit tokenDeposited(poolId,msg.sender,_token0,_token1,_amount0);
    }

    // Register user address for a pool 
    function registerSender(address caller, uint256 poolId) internal{
        // Check if the caller already exists in the user list
        address[] memory addressList = userList[poolId];
        uint256 length = userList[poolId].length;
        bool exist;
        for(uint i = 0; i< length;i++){
            if(addressList[i] == caller){
                exist = true;
            }
        }
        
        // Add caller if the caller does not exist
        if(!exist){
            userList[poolId].push(caller);
        }

    }

    // Bundleswap from ETH
    function bundleswapFromEth(address tokenB,uint256 amountOutmin) public returns(uint256){
        // Check if the pool exists or not
        require(fromEthpool[tokenB].creationTime != 0, "Pool does not exits to perfrom bundleswap");

        // Check if the pool has expired or not
        uint256 timeDiff = block.timestamp - fromEthpool[tokenB].creationTime;
        require(fromEthpool[tokenB].aggregationTime < timeDiff,"Time has not expired. Wait for the pool time to expire");

        // Get pool id
        uint256 _poolId = getEthPoolId(tokenB);            
        uint256 _tokenBalance = getPoolBalance(_poolId);   

        // Define path
        address[] memory path;
        path = new address[](2);
        path[0] = WETH;
        path[1] = tokenB;        

        //Swap tokens
        uint[] memory amounts = IUniswapRouter(UNISWAP_V2_ROUTER).swapExactETHForTokens{value: _tokenBalance}(amountOutmin,path,address(this),block.timestamp);
        uint256 _outputAmount = amounts[1];

        //Emit event
        emit fromEthSwapReceipt(_poolId,tokenB,_tokenBalance,_outputAmount);

        // Return the token to the respective depositors
        batchTransfer(_poolId,tokenB,_outputAmount);

        // Delete pool data
        delete fromEthpool[tokenB];
        delete poolBalance[_poolId];

        // Delete balances;
        address[] memory users = userList[_poolId];
        for(uint i; i < users.length;i++){
            delete balances[users[i]][_poolId];
        }

        // Delete userList
        delete userList[_poolId];

        // Delete pool pair
        delete fromEthPoolPair[_poolId];

        // Remove from active pool list
        for(uint i; i < activePool.length; i++){
            //Check whether the current id is the pool id or not
            if(activePool[i] == _poolId){
                //1. Overwrite the last element to this index
                activePool[i] = activePool[activePool.length-1];
                // 2. Remove the last index as it has been already copied
                activePool.pop();
            }
        }
        
        // Return amount of tokenB received from the swap
        return _outputAmount;

    }

    // Bundleswap to ETH
    function bundleswapToEth(address tokenA,uint256 amountOutmin) public returns(uint256){
                // Check if the pool exists or not
        require(toEthpool[tokenA].creationTime != 0, "Pool does not exits to perfrom bundleswap");

        // Check if the pool has expired or not
        uint256 timeDiff = block.timestamp - toEthpool[tokenA].creationTime;
        require(toEthpool[tokenA].aggregationTime < timeDiff,"Time has not expired. Wait for the pool time to expire");

        // Get pool id
        uint256 _poolId = getToEthPoolId(tokenA);            
        uint256 _tokenBalance = getPoolBalance(_poolId);   

        // Approve Router the token for the swap
        IERC20(tokenA).approve(UNISWAP_V2_ROUTER,_tokenBalance);

        // Define path
        address[] memory path;
        path = new address[](2);
        path[0] = tokenA;
        path[1] = WETH;        

        //Swap tokens
        uint[] memory amounts = IUniswapRouter(UNISWAP_V2_ROUTER).swapExactTokensForETH(_tokenBalance,amountOutmin,path,address(this),block.timestamp);
        uint256 _outputAmount = amounts[1];

        //Emit event
        emit toEthSwapReceipt(_poolId,tokenA,_tokenBalance,_outputAmount);

        // Return the token to the respective depositors
        toEthBatchTransfer(_poolId,_outputAmount);

        // Delete pool data
        delete toEthpool[tokenA];
        delete poolBalance[_poolId];

        // Delete balances;
        address[] memory users = userList[_poolId];
        for(uint i; i < users.length;i++){
            delete balances[users[i]][_poolId];
        }

        // Delete userList
        delete userList[_poolId];

        // Delete pool pair
        delete toEthPoolPair[_poolId];

        // Remove from active pool list
        for(uint i; i < activePool.length; i++){
            //Check whether the current id is the pool id or not
            if(activePool[i] == _poolId){
                //1. Overwrite the last element to this index
                activePool[i] = activePool[activePool.length-1];
                // 2. Remove the last index as it has been already copied
                activePool.pop();
            }
        }
        
        // Return amount of tokenB received from the swap
        return _outputAmount;
    }


    // Swap with Uniswap V2 (Contract automation)
    function bundleswap(address tokenA, address tokenB,uint256 amountOutmin) public returns(uint256) {
        // Check if the pool exists or not
        require(pool[tokenA][tokenB].creationTime != 0, "Pool does not exist to perform bundleswap");

        // Check if the pool has expired or not
        uint256 timeDiff = block.timestamp - pool[tokenA][tokenB].creationTime;
        require(pool[tokenA][tokenB].aggregationTime < timeDiff,"Time has not expired. Wait for the pool time to expire");
        
        // Get pool id
        uint256 _poolId = getPoolId(tokenA,tokenB);            
        uint256 _tokenBalance = getPoolBalance(_poolId);

        // Approve Router the token for the swap
        IERC20(tokenA).approve(UNISWAP_V2_ROUTER,_tokenBalance);

        // Define path 
        address[] memory path;

        if (tokenA == WETH || tokenB == WETH) {
            path = new address[](2);
            path[0] = tokenA;
            path[1] = tokenB;
        } else {
            path = new address[](3);
            path[0] = tokenA;
            path[1] = WETH;
            path[2] = tokenB;
        }

        uint[] memory amounts = IUniswapRouter(UNISWAP_V2_ROUTER).swapExactTokensForTokens(_tokenBalance,amountOutmin,path,address(this),block.timestamp);
        uint256 _outputAmount = tokenA == WETH? amounts[1]:amounts[2];
        
        // Emit event
        emit swapReceipt(_poolId,tokenA,tokenB,_tokenBalance,_outputAmount);

        // Return the token to the respective depositors
        batchTransfer(_poolId,tokenB,_outputAmount);

        // Delete pool data
        delete pool[tokenA][tokenB];
        delete poolBalance[_poolId];

        // Delete balances;
        address[] memory users = userList[_poolId];
        for(uint i; i < users.length;i++){
            delete balances[users[i]][_poolId];
        }

        // Delete userList
        delete userList[_poolId];

        // Delete pool pair
        delete poolPair[_poolId];

        // Remove from active pool list
        for(uint i; i < activePool.length; i++){
            //Check whether the current id is the pool id or not
            if(activePool[i] == _poolId){
                //1. Overwrite the last element to this index
                activePool[i] = activePool[activePool.length-1];
                // 2. Remove the last index as it has been already copied
                activePool.pop();
            }
        }
        
        // Return amount of tokenB received from the swap
        return _outputAmount;
    }

    // Return swapped tokens to the depositors
    function batchTransfer(uint256 poolId, address outputToken,uint256 outAmount) internal returns(bool){
        // Address list
        address[] memory addressList = userList[poolId];
        uint256 length = userList[poolId].length;
        uint256 poolBeforeSwap = poolBalance[poolId];

        // Transfer tokens
        for(uint256 i =0; i < length; i++){
            // Recepient details
            address recepient = addressList[i];
            uint256 depositedToken = balances[recepient][poolId].token0amount;

            // Calculate recepient share of the pool
            uint256 share = (depositedToken*10000)/poolBeforeSwap;
            uint256 tokenToReceive = (share * outAmount) / 10000; 

            //Say deposited token = 1*10^18 , pool before swap = 500 *10^18 , ouputAmount = 250*10^18 
            // (1*10^18 * 10000 ) / 500*10^18 => 20 bps   => 0.2%
            // (20 bps * 250*10^18)  / 10000 => 5 *10^17 => 0.2% => 0.5 tokens 
            
            // Transfer tokens
            (bool safe) = IERC20(outputToken).transfer(recepient,tokenToReceive);
            require(safe == true, "Batch transfer failed");
        }
        return true;

    }

    // Batch transfer with eth as output
    function toEthBatchTransfer(uint256 poolId,uint256 outAmount) internal returns(bool){
                // Address list
        address[] memory addressList = userList[poolId];
        uint256 length = userList[poolId].length;
        uint256 poolBeforeSwap = poolBalance[poolId];

        // Transfer tokens
        for(uint256 i =0; i < length; i++){
            // Recepient details
            address recepient = addressList[i];
            uint256 depositedToken = balances[recepient][poolId].token0amount;

            // Calculate recepient share of the pool
            uint256 share = (depositedToken*10000)/poolBeforeSwap;
            uint256 tokenToReceive = (share * outAmount) / 10000; 

            //Say deposited token = 1*10^18 , pool before swap = 500 *10^18 , ouputAmount = 250*10^18 
            // (1*10^18 * 10000 ) / 500*10^18 => 20 bps   => 0.2%
            // (20 bps * 250*10^18)  / 10000 => 5 *10^17 => 0.2% => 0.5 tokens 
            
            // Transfer eth
            payable(recepient).transfer(tokenToReceive);
        }
        return true;

    }

    // Get minimum output tokens
    function getAmountOutMin(address tokenIn,address tokenOut, uint256 amountIn) public view returns (uint) {

        // Create the path of the swap
        address[] memory path;

        if(tokenIn == WETH || tokenOut == WETH){
            path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut;            
        }
        else{
            path = new address[](3);
            path[0] = tokenIn;
            path[1] = WETH;
            path[2] = tokenOut;   

        }

        // Call uniswap
        uint[] memory amountOutMins = IUniswapRouter(UNISWAP_V2_ROUTER).getAmountsOut(amountIn, path);
        return amountOutMins[path.length - 1];
    }

    // Get minimum output tokens from eth
    function fromEthGetAmountsOutMin(address tokenOut,uint256 amountIn) public view returns(uint){

        // Create the path of the swap
        address[] memory path;
        path = new address[](2);
        path[0] = WETH;
        path[1] = tokenOut;

        uint[] memory amountOutMins = IUniswapRouter(UNISWAP_V2_ROUTER).getAmountsOut(amountIn,path);      
        return amountOutMins[path.length - 1];
    }

    // Get minimum output tokens to eth
    function toEthGetAmountsOutMin(address tokenIn,uint256 amountIn) public view returns(uint){

        // Create the path of the swap
        address[] memory path;
        path = new address[](2);
        path[0] = tokenIn;
        path[1] = WETH;

        uint[] memory amountOutMins = IUniswapRouter(UNISWAP_V2_ROUTER).getAmountsOut(amountIn,path);      
        return amountOutMins[path.length - 1];
    }

    // Sort token 
    function sort(address token0, address token1) internal pure returns(address,address){
        return token0<token1?(token0,token1):(token1,token0);
    }


    // Get list of expired pools for (Token => Token) pool
    function getExpiredPools() view internal returns(uint[] memory){

        // List of expired pools
        uint[] memory expiredPools = new uint[](activePool.length);
        uint index = 0;
        // List of active pools
        for(uint256 i; i < activePool.length;i++){
 
            // Get current pool id
            uint256 _currPoolId = activePool[i];
            // Check if the time for the current pool has expired or not
            address _token0 = poolPair[_currPoolId].token0;
            address _token1 = poolPair[_currPoolId].token1;

            // Calculate the time passed since pool creation
            uint256 timePassed = block.timestamp - pool[_token0][_token1].creationTime;
            uint256 timeLimit = pool[_token0][_token1].aggregationTime;

            // If the pool id belongs to the pool
            if(timeLimit != 0){
                // If the the pool time has expired, add to expired pool list
                if(timeLimit < timePassed){
                    // Push the id tto the array
                    expiredPools[index] = _currPoolId;

                    // Increment index
                    index++;
                }
            }        
        }

        return expiredPools;

    }

    // Get list of expired pools for (Tokens => Eth) pool
    function fromEthGetExpiredPools() view internal returns(uint[] memory){
                // List of expired pools
        uint[] memory expiredPools = new uint[](activePool.length);
        uint index = 0;
        // List of active pools
        for(uint256 i; i < activePool.length;i++){
 
            // Get current pool id
            uint256 _currPoolId = activePool[i];
            // Check if the time for the current pool has expired or not
            address tokenOut = fromEthPoolPair[_currPoolId];

            // Calculate the time passed since pool creation
            uint256 timePassed = block.timestamp - fromEthpool[tokenOut].creationTime;
            uint256 timeLimit = fromEthpool[tokenOut].aggregationTime;

            // If the pool id belongs to the pool
            if(timeLimit != 0){
                // If the the pool time has expired, add to expired pool list
                if(timeLimit < timePassed){
                    // Push the id tto the array
                    expiredPools[index] = _currPoolId;

                    // Increment index
                    index++;
                }
            }        
        }

        return expiredPools;
    }

    // Get list of expired pools for (ETH => Tokens pool)
        function toEthGetExpiredPools() view internal returns(uint[] memory){
                // List of expired pools
        uint[] memory expiredPools = new uint[](activePool.length);
        uint index = 0;
        // List of active pools
        for(uint256 i; i < activePool.length;i++){
 
            // Get current pool id
            uint256 _currPoolId = activePool[i];
            // Check if the time for the current pool has expired or not
            address tokenIn = toEthPoolPair[_currPoolId];

            // Calculate the time passed since pool creation
            uint256 timePassed = block.timestamp - toEthpool[tokenIn].creationTime;
            uint256 timeLimit = toEthpool[tokenIn].aggregationTime;

            // If the pool id belongs to the pool
            if(timeLimit != 0){
                // If the the pool time has expired, add to expired pool list
                if(timeLimit < timePassed){
                    // Push the id tto the array
                    expiredPools[index] = _currPoolId;

                    // Increment index
                    index++;
                }
            }        
        }

        return expiredPools;
    }

    // Chainlink automation for bundleswap function
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // List of expired pools
        uint[] memory expiredPools = getExpiredPools();
        uint[] memory fromEthExpiredPools = fromEthGetExpiredPools();
        uint[] memory toEthExpiredPools = toEthGetExpiredPools();


        // Check if there were any expired pools 
        for(uint i; i < expiredPools.length;i++){
            if(expiredPools[i] != 0){
                upkeepNeeded = true;
            }
        }
        // Check if there were any from expired pools 
        for(uint i; i < fromEthExpiredPools.length;i++){
            if(fromEthExpiredPools[i] != 0){
                upkeepNeeded = true;
            }
        }
        // Check if there were any to expired pools 
        for(uint i; i < toEthExpiredPools.length;i++){
            if(toEthExpiredPools[i] != 0){
                upkeepNeeded = true;
            }
        }

        performData = abi.encode(expiredPools,fromEthExpiredPools,toEthExpiredPools);
        return (upkeepNeeded,performData);
    }

    function performUpkeep(bytes calldata performData) external override {

        // Decode the data passed by checkupkeep
        (uint[] memory expiredPools,uint[] memory fromEthExpiredPools, uint[] memory toEthExpiredPools) = abi.decode(performData,(uint[],uint[],uint[]));

        // Call bundleswap for expired pools
        for(uint256 i; i < expiredPools.length;i++){
            if(expiredPools[i]!= 0){
                // Get pair address 
                address _token0 = poolPair[expiredPools[i]].token0;
                address _token1 = poolPair[expiredPools[i]].token1;

                // Get minimum out amount
                uint256 minimumAmount = getAmountOutMin(_token0,_token1,poolBalance[expiredPools[i]]);

                //Execute bundleswap
                bundleswap(_token0,_token1,minimumAmount);

            }
        }

        // Call bundleswap for fromEthexpired pools

        for(uint256 i; i < fromEthExpiredPools.length;i++){
            if(fromEthExpiredPools[i]!= 0){
                // Get pair address 
                address tokenB = fromEthPoolPair[fromEthExpiredPools[i]];

                // Get minimum out amount
                uint256 minimumAmount = fromEthGetAmountsOutMin(tokenB,poolBalance[fromEthExpiredPools[i]]);

                //Execute bundleswap
                bundleswapFromEth(tokenB,minimumAmount);

            }
        }

        // Call bundleswap for toEthexpired pools

        for(uint256 i; i < toEthExpiredPools.length;i++){
            if(toEthExpiredPools[i]!= 0){
                // Get pair address 
                address tokenA = toEthPoolPair[toEthExpiredPools[i]];

                // Get minimum out amount
                uint256 minimumAmount = toEthGetAmountsOutMin(tokenA,poolBalance[toEthExpiredPools[i]]);

                //Execute bundleswap
                bundleswapToEth(tokenA,minimumAmount);
            }
        }

    }

    receive()external payable{

    }

    fallback()external payable{
        
    }
}