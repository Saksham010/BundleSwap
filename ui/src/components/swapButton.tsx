import {ConnectButton} from "@rainbow-me/rainbowkit";


export default function SwapButton(){
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


        
    
        </>


    )
}