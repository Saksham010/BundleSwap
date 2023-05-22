import {ConnectButton} from "@rainbow-me/rainbowkit";
import "./header.css";
export default function Header(){
    return(
        <> 
            <div className="header">
                <h1>BundleSwap</h1>
                <div className="headerConnect">
                    <ConnectButton />
                </div>
            </div>
        </>
    )
}