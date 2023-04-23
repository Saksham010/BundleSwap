pragma solidity 0.8.18;

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

    function getAmountsOut(uint amountIn, address[] memory path) external returns (uint[] memory amounts);

}

contract BundleSwap{
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

    // Token0 => Token1 => AggregationTime
    mapping(address=>mapping(address => poolDetail)) pool;


    // Store user balances
    struct deposits{
        uint256 token0amount;
        uint256 token1amount;
    }

    // User deposits (User -> pool id)
    mapping(address => mapping (uint256 => deposits)) balances; 
    // pool id => User array
    mapping(uint256 => address[]) userList;
    // Pool id => total amount
    mapping(uint256 => uint256) poolBalance;


    // Events
    event poolCreated(address,address,uint256);
    event tokenDeposited(uint id,address sender, address tokenIn, address tokenOut, uint256 amount);
    event swapReceipt(uint id, address tokenIn, address tokenOut, uint256 inAmount, uint256 outAmount);

    // Create a new pool
    function createSwapPool(address tokenA, address tokenB,uint256 aggregationTime) internal{
        // Create pool
        pool[tokenA][tokenB] = poolDetail(counter,aggregationTime,block.timestamp);
        //Increment counter
        counter++;

        // Emit event
        emit poolCreated(tokenA,tokenB,aggregationTime);
    }

    //Get pool id 
    function getPoolId(address token0, address token1) public view returns(uint256){
        return pool[token0][token1].id;
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

            // Pool balance store
            uint256 poolId = getPoolId(_token0,_token1);    

            // Update the amount of tokens deposited by the user
            balances[msg.sender][poolId].token0amount += _amount0;
            balances[msg.sender][poolId].token1amount += _amount1;

            // Update user list and pool balance
            registerSender(msg.sender,poolId);
            poolBalance[poolId] += _amount0;

            // Transfer Token A and Token B to the contract
            bool success = IERC20(_token0).transferFrom(msg.sender,address(this),_amount0);
            require(success == true,"Token0 transfer failed");

            // Emit event
            emit tokenDeposited(poolId,msg.sender,_token0,_token1,_amount0);

        } 
        else{
            // If the pool already exists

            // Check aggregation time
            uint256 timeElapsed = block.timestamp - pool[_token0][_token1].creationTime;
            require(timeElapsed < pool[_token0][_token1].aggregationTime, "Cannot deposit after pool time expired. Create a new pool");

            // Pool balance store
            uint256 poolId = getPoolId(_token0,_token1);  

            // Update the amount of tokens deposited by the user
            balances[msg.sender][poolId].token0amount += _amount0;
            balances[msg.sender][poolId].token1amount += _amount1;

            // Update user list and pool balance
            registerSender(msg.sender,poolId);
            poolBalance[poolId] += _amount0;

            // Transfer Token A and Token B to the contract
            IERC20(_token0).transferFrom(msg.sender,address(this),_amount0);
            // require(safe == true,"Token0 transfer failed");

            // Emit event
            emit tokenDeposited(poolId,msg.sender,_token0,_token1,_amount0);
        }
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
        batchTransfer(userList[_poolId],_poolId,tokenB,_outputAmount);

        // Delete pool data
        delete pool[tokenA][tokenB];
        delete poolBalance[_poolId];
        // delete balances; (requires loop)
        delete userList[_poolId];

        // Return amount of tokenB received from the swap
        return _outputAmount;
    }

    // Return swapped tokens to the depositors
    function batchTransfer(address[] memory recepients,uint256 poolId, address outputToken,uint256 outAmount) internal returns(bool){
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

    }

    // Get minimum output tokens
    function getAmountOutMin(address tokenIn,address tokenOut, uint256 amountIn) public returns (uint) {

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

    // Sort token 
    function sort(address token0, address token1) internal pure returns(address,address){
        return token0<token1?(token0,token1):(token1,token0);
    }


}