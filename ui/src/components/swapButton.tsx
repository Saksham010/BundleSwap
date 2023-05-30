import {ConnectButton} from "@rainbow-me/rainbowkit";
import BundleSwapABI from "../../ABI/Bundleswapabi.json"
import ERC20ABI from "../../ABI/ERC20ABI.json";
import { writeContract } from '@wagmi/core'
import { parseEther } from "ethers/lib/utils.js";
import { waitForTransaction } from '@wagmi/core'

export default function SwapButton(props:any){

    async function swapFromETH(){
        console.log("Value: ",parseEther(props.input1))

        const { hash } = await writeContract({
            address: '0x95f62D72dDB6c82105F2832Fb2bE6CF633416B19',
            abi: BundleSwapABI,
            functionName: 'registerSwapFromETHToToken',
            args: [props.token2.address,parseEther("0"),100,{value:parseEther(props.input1)}],

        });

        const receipt = await waitForTransaction({
            hash: hash,
          })

        console.log("Receipt: ",receipt);
        alert(`Successfull: ${receipt.transactionHash}`)

    }

    async function swapToETH(){

        const address = props.token1.address;
        const amount = parseEther(props.input1);

        // Approve the contract to transfer token
        console.log("Approving");
        const {hash} = await writeContract({
            address:address,
            abi:ERC20ABI,
            functionName:'approve',
            args:["0x95f62D72dDB6c82105F2832Fb2bE6CF633416B19",amount]
        });

        const receipt = await waitForTransaction({hash:hash});

        console.log("Approved, Receipt: ",receipt);
        alert("Receipt")


        // Register swap
        console.log("Registering");
        const obj = await writeContract({
            address: '0x95f62D72dDB6c82105F2832Fb2bE6CF633416B19',
            abi: BundleSwapABI,
            functionName: 'registerSwapFromTokentoEth',
            args: [address,amount,100],

        });

        const receipt2 = await waitForTransaction({
            hash: obj.hash,
          })

        console.log("Registered, Receipt: ",receipt2);
        alert(`Registered: ${receipt2.transactionHash}`)

    }

    async function swapTokenForToken(){

        const token1address = props.token1.address;
        const token1name = props.token1.name;
        const token2address = props.token2.address;

        const amountOne = parseEther(props.input1);
        const amountTwo = parseEther("0");


        // Approve the contract to transfer token
        console.log("Approving ",token1name);
        const {hash} = await writeContract({
            address:token1address,
            abi:ERC20ABI,
            functionName:'approve',
            args:["0x95f62D72dDB6c82105F2832Fb2bE6CF633416B19",amountOne]
        });

        const receiptOne = await waitForTransaction({hash:hash});

        console.log("Approved ",token1name ,"Receipt: ",receiptOne);
        alert(`Approved ${token1name}`);
        

        // Register swap
        console.log("Registering");
        const obj = await writeContract({
            address: '0x95f62D72dDB6c82105F2832Fb2bE6CF633416B19',
            abi: BundleSwapABI,
            functionName: 'registerSwap',
            args: [token1address,token2address,amountOne,amountTwo,100],
        });

        const receipt2 = await waitForTransaction({
            hash: obj.hash,
          })

        console.log("Registered, Receipt: ",receipt2);
        alert(`Registered: ${receipt2.transactionHash}`)       
    }


    function perfromSwap(){
        if(props.token2.name != 'Select token'){
            console.log("Token1: ",props.token1);
            console.log("Token2 : ",props.token2);
            if(props.token1.symbol == props.token2.symbol){
                alert("Two same token cannot be swapped");
                return;
            }   

            if(parseFloat(props.token1.balance) < parseFloat(props.input1)){
                alert("Oops you dont have enough amount of tokens");
            }
            else{
                if(props.token1.symbol == 'ETH'){
                    console.log("From ETH token logic");
                    swapFromETH();   
    
                }
                else if(props.token2.symbol == 'ETH'){
                    console.log("TO ETH token logic");
                    swapToETH();
                }
                else{
                    console.log("Token to token logic");
                    swapTokenForToken();
                }
            }
            

        }
        
    }

    return(
        <>
            <div className="connectContainer">
                <ConnectButton.Custom>
                    {({
                        account,
                        chain,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                    }) => {
                        // Note: If your app doesn't use authentication, you
                        // can remove all 'authenticationStatus' checks
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                            authenticationStatus === 'authenticated');

                        return (
                        <div
                            {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                            })}
                        >
                            {(() => {
                            if (!connected) {
                                return (
                                <button onClick={openConnectModal} type="button">
                                    Connect Wallet
                                </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                <button onClick={openChainModal} type="button">
                                    Wrong network
                                </button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={()=>{

                                        // perfromSwap();
                                        }}>
                                        Bundle Swap
                                    </button>

                                </div>
                            );
                            })()}
                        </div>
                        );
                    }}
                </ConnectButton.Custom>
            </div>


        
    
        </>


    )
}