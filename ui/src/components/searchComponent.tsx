import { fetchToken } from '@wagmi/core'
import { ethers } from "ethers";
import { useEffect, useState } from 'react';
export default function SearchComponent(props:any) {

    const[address,setAddress] = useState('');

    function getToken(){
        // Check if the address is correct or not
        const isCorrectAddress:boolean = ethers.utils.isAddress(address);
        // console.log("Address: ",typeof(address));

        if(isCorrectAddress){
            // For typescript
            const token = fetchToken({
                address:ethers.utils.getAddress(address),
            });
            token.then((obj)=>{
                let name = obj.name;
                let symbol = obj.symbol;
    
                props.setSearchData({name:name,symbol:symbol,address:address})
    
            }).catch((err)=>{
                console.log("Error in fetching token: ",err);
            });
        }
    }


    useEffect(()=>{
        if(address == ''){
            props.setSearchData({name:'',symbol:'',address:''});
            
        }

        getToken();
    },[address])
    


    return (
        <div className="searchbox pr-3">
            <form className=" px-4">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        value={address}
                        onChange={(event)=>{
                            console.log("Onchange: ",event);
                            setAddress(event.target.value);
                        }}
                        ref={props.reference}
                        type="text"
                        placeholder="Paste contract address"
                        className="w-full py-3 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-pink-600" onFocus={()=>{props.search(true)} }
                    />
                </div>
            </form>
        </div>
    );
}
