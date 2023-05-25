import {useContractRead} from 'wagmi';
import ERC20ABI from "../../ABI/ERC20ABI.json";
import { useState } from 'react';

export default function TickerSearch(){
    const[address] = useState('');
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

