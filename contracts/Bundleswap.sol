pragma solidity 0.8.8;

contract BundleSwap{

    // Swap pool


    // Token0 => Token1 => AggregationTime
    mapping(address=>mapping(address => uint)) pool;

    struct poolDetail{
        uint256 id;
        address tokenA;
        address tokenB;
    }

    // Create a new pool
    function createSwapPool(address tokenA, address tokenB,uint256 aggregationTime) internal{
        // Create pool
        pool[tokenA][tokenB] = aggregationTime;
    }

    // Register swap request
    function registerSwap(address tokenA, address tokenB, uint256 aggregationTime) public{

        // Sort tokens
        (address _token0, address _token1) = sort(tokenA,tokenB);

        // Check if the pool exists or not
        if(pool[_token0][_token1]== 0){
            // If does not exist create a pool
            createSwapPool(_token0,_token1,aggregationTime);

            // Pool balance store

        } 
        else{
            // If the pool already exists

        }

    }



    // Sort token 
    function sort(address token0, token1) internal pure returns(address,address){
        return token0<token1?(token0,token1):(token1,token0);
    }


}