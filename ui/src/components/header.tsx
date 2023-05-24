import {ConnectButton} from "@rainbow-me/rainbowkit";
import "./header.css";
export default function Header(){
    return(
        <> 
            <div className="header py-12 pr-10">
                <h1 className="text-4xl font-semibold">BundleSwap</h1>
                {/* <h1>BundleSwap</h1> */}
                <div className="headerConnect">
                    <ConnectButton />
                </div>
            </div>
        </>
    )
}