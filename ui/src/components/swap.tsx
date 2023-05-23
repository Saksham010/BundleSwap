import "./swap.css";
import {ConnectButton} from "@rainbow-me/rainbowkit";
export default function Swap(){
    const ethLogoPath = "https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,fl_sanitize,q_auto,w_48/https://raw.githubusercontent.com/sushiswap/list/master/logos/native-currency-logos/ethereum.svg";

    return (
        <>
            <div className="swapContainer">                
                <div className="dexContainer">
                    <div className="dexHeader">                        
                        <h2>Swap Token </h2>  
                        <h4>Pool status: NaN</h4>  
                    </div>

                    <div className="dexinnerContainer">
                        <div className="box">
                            <div className="boxInner">
                                <div className="boxInput">
                                    <input placeholder="0"></input>
                                </div>
                                <div className="tickerContainer" id="firstTicker">
                                    <button>
                                        <div className="tickerlogoContainer">
                                            <img src={ethLogoPath}></img>
                                        </div>
                                        <h3>ETH</h3>
                                        <div className="svgContainer">
                                            <svg width="30" height="30" version="1.1" viewBox="70 80 450 300" fill="black" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m277.89 214.98c-3.6953-5.2773-10.969-6.5625-16.246-2.8672-5.2773 3.6953-6.5625 10.969-2.8672 16.246l81.664 116.67c4.6484 6.6367 14.473 6.6367 19.117 0l81.668-116.67c3.6953-5.2773 2.4102-12.551-2.8672-16.246-5.2812-3.6953-12.555-2.4102-16.25 2.8672l-72.109 103.01z"/>
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <p className="balance">Balance: NaN </p>
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
                                        <h3>Select token</h3>
                                        <div className="svgContainer">
                                            <svg width="30" height="30" version="1.1" viewBox="70 80 450 300" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m277.89 214.98c-3.6953-5.2773-10.969-6.5625-16.246-2.8672-5.2773 3.6953-6.5625 10.969-2.8672 16.246l81.664 116.67c4.6484 6.6367 14.473 6.6367 19.117 0l81.668-116.67c3.6953-5.2773 2.4102-12.551-2.8672-16.246-5.2812-3.6953-12.555-2.4102-16.25 2.8672l-72.109 103.01z"/>
                                            </svg>
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
        </>
    )
}