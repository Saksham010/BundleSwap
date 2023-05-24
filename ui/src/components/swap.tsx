import "./swap.css";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import { useState } from "react";
export default function Swap(){
    const ethLogoPath = "https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,fl_sanitize,q_auto,w_48/https://raw.githubusercontent.com/sushiswap/list/master/logos/native-currency-logos/ethereum.svg";
    const [showModal, setShowModal] = useState(false);

    return (
        <>

            <div className="swapContainer">                
                <div className="dexContainer pt-12 ">
                    <div className="dexHeader pb-4">                        
                        <h2 className="text-xl font-semibold">Swap Token </h2>  
                        <h4 className="text-md font-semibold">Pool status: NaN</h4>  
                    </div>

                    <div className="dexinnerContainer">
                        <div className="box">
                            <div className="boxInner">
                                <div className="boxInput">
                                    <input placeholder="0"></input>
                                </div>
                                <div className="tickerContainer" id="firstTicker">
                                    <button onClick={()=>{setShowModal(!showModal)}} >
                                        <div className="tickerwrapper flex py-2 pl-1">
                                            <div className="tickerlogoContainer ">
                                                <img src={ethLogoPath}></img>
                                            </div>
                                            <h3 className="text-sm pt-1 pl-1 font-medium antialiased">ETH</h3>
                                            <div className="svgContainer">
                                                <svg width="30" height="30" version="1.1" viewBox="70 130 450 300" fill="black" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="m277.89 214.98c-3.6953-5.2773-10.969-6.5625-16.246-2.8672-5.2773 3.6953-6.5625 10.969-2.8672 16.246l81.664 116.67c4.6484 6.6367 14.473 6.6367 19.117 0l81.668-116.67c3.6953-5.2773 2.4102-12.551-2.8672-16.246-5.2812-3.6953-12.555-2.4102-16.25 2.8672l-72.109 103.01z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <p className="balance ">Balance: NaN </p>
                        </div>
                        <div className="dexDivider"></div>
                        <div className="motionContainer" >
                            <div className="flipIconContainer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 -5 23 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>            

                            </div>

                        </div>

                        <div className="box">
                            <div className="boxInner">
                                <div className="boxInput">
                                    <input placeholder="0"></input>
                                </div>
                                <div className="tickerContainer" id="secondTicker">
                                    <button>
                                        <div className="tickerwrapper flex items-center py-2 pl-1">

                                            <h3 className="text-sm font-medium" onClick={()=>{
                                                setShowModal(!showModal);
                                            }}>Select token</h3>
                                            <div className="svgContainer">
                                                <svg width="30" height="30" version="1.1" viewBox="70 105 450 300" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="m277.89 214.98c-3.6953-5.2773-10.969-6.5625-16.246-2.8672-5.2773 3.6953-6.5625 10.969-2.8672 16.246l81.664 116.67c4.6484 6.6367 14.473 6.6367 19.117 0l81.668-116.67c3.6953-5.2773 2.4102-12.551-2.8672-16.246-5.2812-3.6953-12.555-2.4102-16.25 2.8672l-72.109 103.01z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <p className="balance">Balance: NaN </p>
                        </div>

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
                                                <button>
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
                    </div>

                </div>

            </div>

            {showModal&&(
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                        {/*content*/}
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                            {/*header*/}
                            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                            <h3 className="text-3xl font-semibold">
                                Modal Title
                            </h3>
                            <button
                                className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                onClick={() => setShowModal(false)}
                            >
                                <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                ×
                                </span>
                            </button>
                            </div>
                            {/*body*/}
                            <div className="relative p-6 flex-auto">
                            <p className="my-4 text-slate-500 text-lg leading-relaxed">
                                I always felt like I could do anything. That’s the main
                                thing people are controlled by! Thoughts- their perception
                                of themselves! They're slowed down by their perception of
                                themselves. If you're taught you can’t do anything, you
                                won’t do anything. I was taught I could do everything.
                            </p>
                            </div>
                            {/*footer*/}
                            <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                            <button
                                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                            <button
                                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => setShowModal(false)}
                            >
                                Save Changes
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            )}

                                

        </>
    )
}