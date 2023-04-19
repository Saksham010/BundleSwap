pragma solidity 0.8.8;

interface IERC20{
    transferFrom(address sender, address recipient, uint256 amount)external returns(bool);
}

contract BundleSwap{

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


    // Events
    event poolCreated(address,address,uint256);

    // Create a new pool
    function createSwapPool(address tokenA, address tokenB,uint256 aggregationTime) internal{
        // Create pool
        pool[tokenA][tokenB] = poolDetail(counter,aggregationTime,block.timestamp);
        //Increment counter
        counter++;

        // Emit event
        emit poolCreated(tokenA,tokenB,aggregationTime);
    }

    // Register swap request (TokenA/TokenB)
    function registerSwap(address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 aggregationTime) public{

        // Sort tokens
        (address _token0, address _token1) = sort(tokenA,tokenB);
        // Sort amount
        (uint256 _amount0,uint256 _amount1) = (tokenA == _token0)? (amountA,amountB): (amountB,amountA);

        // Check if the pool exists or not
        if(pool[_token0][_token1].creationTime == 0){
            // If does not exist create a pool
            createSwapPool(_token0,_token1,aggregationTime);

            // Pool balance store
            uint256 poolId = pool[_token0][_token1].id;
            balances[msg.sender][poolId] = deposits(_amount0,_amount1);

            // Transfer Token A and Token B to the contract
            bool safe = IERC20(_token0).transferFrom(msg.sender,address(this),_amount0);
            require(safe == true,"Token0 transfer failed");
            safe = IERC20(_token1).transferFrom(msg.sender,address(this),_amount1);
            require(safe == true,"Token0 transfer failed");


        } 
        else{
            // If the pool already exists

            // Check aggregation time
            uint256 timeElapsed = block.timestamp - pool[_token0][_token1].creationTime;
            require(timeElapsed < pool[_token0][_token1].aggregationTime, "Cannot deposit after pool time expired. Create a new pool");

            // Pool balance store
            uint256 poolId = pool[_token0][_token1].id;
            balances[msg.sender][poolId] = deposits(_amount0,_amount1);

            // Transfer Token A and Token B to the contract
            bool safe = IERC20(_token0).transferFrom(msg.sender,address(this),_amount0);
            require(safe == true,"Token0 transfer failed");
            safe = IERC20(_token1).transferFrom(msg.sender,address(this),_amount1);
            require(safe == true,"Token0 transfer failed");
        }
    }

    // Swap with Uniswap V2 router
    function bundleswap(address tokenA, address tokenB) public {

    }


    // Sort token 
    function sort(address token0, token1) internal pure returns(address,address){
        return token0<token1?(token0,token1):(token1,token0);
    }


}