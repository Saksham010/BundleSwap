// import { useContract } from 'wagmi'

// import { useProvider } from 'wagmi'
// import BundleSwapABI from "../../ABI/Bundleswapbi.json"


// export default function ActivePools(){
//     const provider = useProvider();
//     console.log("Provider: ",provider);
//     const contract = useContract({
//         address:'0xDAeA149DAFAe63E41665f5960e4a27D24CE1c1B4',
//         abi:BundleSwapABI,
//         Provider:provider
//     });

//     const USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
//     const LINK_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
//     return(
//         <>
//          <h1>Active pools: </h1>
//         </>
//     )
// }

import {useContractRead} from 'wagmi';
import ERC20ABI from "../../ABI/ERC20ABI.json";
import { useState } from 'react';

export default function TickerSearch(){
    const[address,setAddress] = useState('');
    // USDC: 0x07865c6E87B9F70255377e024ace6630C1Eaa37F

    function fetchData(address:string,params:string):string{
        const {data,isFetched,isSuccess} = useContractRead({
            address:address,
            abi:ERC20ABI,
            functionName:params
        })

        if(isFetched && isSuccess){
            return data;

        }
        else{
            return 'Fetching data';
        }
    }

    const name:string = fetchData(address,'name');
    const ticker:string = fetchData(address,'symbol');


    console.log("Name: ",name," Ticker: ",ticker);


    return(
        <>
            {/* <input onChange={(obj)=>{
                setAddress(String(obj.target.value));
            }} value={address} ></input> */}
        </>
    )
}

