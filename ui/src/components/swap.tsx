import "./swap.css";
import {ConnectButton} from "@rainbow-me/rainbowkit";
export default function Swap(){
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
                                <div className="tickerContainer">
                                    <h3>ETH</h3>
                                </div>
                            </div>
                            <p className="balance">Balance: NaN </p>
                        </div>
                        <div className="dexDivider"></div>

                        <div className="box">
                            <div className="boxInner">
                                <div className="boxInput">
                                    <input placeholder="0"></input>
                                </div>
                                <div className="tickerContainer">
                                    <h3>BNDL</h3>
                                </div>
                            </div>
                            <p className="balance">Balance: NaN </p>
                        </div>

                        <div className="connectContainer">
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openAccountModal,
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