export default function TokenList(props:any){
    const ethLogoPath:string = "https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,fl_sanitize,q_auto,w_48/https://raw.githubusercontent.com/sushiswap/list/master/logos/native-currency-logos/ethereum.svg";
    const wethLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png";
    const aaveLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png";
    const uniLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png";
    const usdcLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png";
    const usdtLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png";
    const wbtcLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png";

    type showcaseList = {
        logo:string;
        ticker:string;
        symbol:string;
        balance:string;
    };

    const showcase:showcaseList[] = [
        {logo:ethLogoPath,ticker:'Ether',symbol:'ETH',balance:'0'},
        {logo:wethLogoPath,ticker:'Wrapped Ether',symbol:'WETH',balance:'0'},
        {logo:usdcLogoPath,ticker:'USDCoin',symbol:'USDC',balance:'0'},
        {logo:usdtLogoPath,ticker:'Tether USD',symbol:'USDT',balance:'0'},
        {logo:aaveLogoPath,ticker:'Aave',symbol:'AAVE',balance:'0'},
        {logo:wbtcLogoPath,ticker:'Wrapped Bitcoin',symbol:'WBTC',balance:'0'},
        {logo:uniLogoPath,ticker:'Uinswap',symbol:'UNI',balance:'0'},    
    ];
    let classString = "listContainer  min-w-full pl-6  flex justify-between py-2 hover:bg-slate-50 cursor-pointer rounded-lg";

    // console.log("Token list props: ",props);
    if(props.skeleton){
        classString += ' animate-pulse';
    }else{
        classString.replace('animate-pulse','');
    }

    function tokenBox(logopath:string,ticker:string,symbol:string,balance:string){

        return(
            <div className={classString}>
                <div className="tokenbox flex  flex-1 ">
                    <div className="tokenimg w-11 ">
                        <img src={logopath} width="100%"></img>
                    </div>

                    <div className="tokeninfo flex flex-col space-y-0 pl-3 pt-1 " >
                        <div className="tokenname h-2/6 ">
                            <p className="text-medium font-medium">{ticker}</p>
                        </div>
                        <div className="tokensymbol py-1 ">
                            <p className="text-xs text-zinc-300" >{symbol}</p>
                        </div>
                    </div>
                </div>
                <div className="tokenAmount self-center flex-1 text-right pr-8">
                        <p>{balance}</p>
                </div>
            </div>
        );

    }


    const elements = showcase.map((obj)=>{
        return(
            <>
                {tokenBox(obj.logo,obj.ticker,obj.symbol,obj.balance)}
            </>
        )
    });

    // console.log(elements)






    return(
        <>
               
            {elements}
        
        </>
    )
}