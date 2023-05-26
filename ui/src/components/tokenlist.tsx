
export default function TokenList(props:any){
    const ethLogoPath:string = "https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,fl_sanitize,q_auto,w_48/https://raw.githubusercontent.com/sushiswap/list/master/logos/native-currency-logos/ethereum.svg";
    const wethLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png";
    const aaveLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png";
    const uniLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png";
    const usdcLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png";
    const usdtLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png";
    const wbtcLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png";
    const linkLogoPath:string = "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png";

    // List of default logos
    const logoList = {
        ETH:ethLogoPath,
        WETH:wethLogoPath,
        AAVE:aaveLogoPath,
        UNI:uniLogoPath,
        USDC:usdcLogoPath,
        USDT:usdtLogoPath,
        WBTC:wbtcLogoPath,
        LINK:linkLogoPath
    }

    // Type of keys of logolist
    type Keys = keyof typeof logoList;

    // Searched token list
    let searchedToken = props.searchedToken;

    // Showcase list
    type showcaseList = {
        logo:string;
        name:string;
        symbol:string;
        balance:string;
        address:string;
    };

    const showcase:showcaseList[] = [
        {logo:ethLogoPath,name:'Ether',symbol:'ETH',balance:'0',address:'ethereum'},
        {logo:wethLogoPath,name:'Wrapped Ether',symbol:'WETH',balance:'0',address:'0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'},
        {logo:usdcLogoPath,name:'USDCoin',symbol:'USDC',balance:'0',address:'0x07865c6E87B9F70255377e024ace6630C1Eaa37F'},
        {logo:usdtLogoPath,name:'Tether USD',symbol:'USDT',balance:'0',address:'0x6ad196dbcd43996f17638b924d2fdedff6fdd677'},
        {logo:aaveLogoPath,name:'Aave',symbol:'AAVE',balance:'0',address:'0x63242b9bd3c22f18706d5c4e627b4735973f1f07'},
        {logo:wbtcLogoPath,name:'Wrapped Bitcoin',symbol:'WBTC',balance:'0',address:'0xdA4a47eDf8ab3c5EeeB537A97c5B66eA42F49CdA'},
        {logo:uniLogoPath,name:'Uinswap',symbol:'UNI',balance:'0',address:'0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'},    
        {logo:linkLogoPath,name:'Chainlink',symbol:'LINK',balance:'0',address:'0x326C977E6efc84E512bB9C30f76E30c160eD06FB'},
    ];
    let classString = "listContainer  min-w-full pl-6  flex justify-between py-2 hover:bg-slate-50 cursor-pointer rounded-lg";

    // console.log("Token list props: ",props);
    if(props.skeleton){
        classString += ' animate-pulse';
    }else{
        classString.replace('animate-pulse','');
    }

    function tokenBox(logopath:string,name:string,symbol:string,balance:string,address:string){
        const deselectName:string = props.modalId == 1?props.token2.name:props.token1.name;

        if(name == deselectName){
            classString  = classString.replace('cursor-pointer','cursor-not-allowed');
        }else{
            classString = classString.replace('cursor-not-allowed','cursor-pointer');
        }

        return(
            <div className={classString} onClick={()=>{
                if(name != deselectName){
                    props.closeModal();
                    console.log("Modal id: ", props.modalId);
                    props.modalId == 1? props.updateToken1({name:name,symbol:symbol,address:address,logo:logopath}):props.updateToken2({name:name,symbol:symbol,address:address,logo:logopath});
                }
            }}>
                <div className="tokenbox flex  flex-1 ">
                    <div className="tokenimg w-11 ">
                        <img src={logopath} width="100%"></img>
                    </div>

                    <div className="tokeninfo flex flex-col space-y-0 pl-3 pt-1 " >
                        <div className="tokenname h-2/6 ">
                            <p className="text-medium font-medium">{name}</p>
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

    let elements;
    // If not searched or failed then showcase list
    if((searchedToken.name == ''||undefined) && (searchedToken.symbol == ''||undefined)){

        elements = showcase.map((obj)=>{
            return(
                <>
                    {tokenBox(obj.logo,obj.name,obj.symbol,obj.balance,obj.address)}
                </>
            )
        });
    }
    else{
        let path:string = ethLogoPath;
        // Check if the logo exists 
        const keyarr = Object.keys(logoList);
        keyarr.map((key:any)=>{
            const index:Keys = key;
            if(searchedToken.symbol == index){
                path = logoList[index]; 
            }
        })

        elements = <>{tokenBox(path,searchedToken.name,searchedToken.symbol,'0',searchedToken.address)}</>
    }


    return(
        <>
               
            {elements}
        
        </>
    )
}