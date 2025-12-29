// paygate.js - minimal "PayGate" frontend-only snippet
// Works with Phantom via window.solana (no server, no express)

const SOLANA_CLUSTER = "mainnet-beta"; // you can switch to "devnet" for testing
const RPC_URL = (SOLANA_CLUSTER === "devnet")
    ? "https://api.devnet.solana.com"
    : "https://api.mainnet-beta.solana.com";

// We use Solana web3 from a CDN (loaded in docs.html below)
function assertWeb3() {
    if (!window.solanaWeb3) {
        throw new Error("solanaWeb3 not found. Did you include the web3.js CDN script?");
    }
}

function shorten(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 4) + "…" + addr.slice(-4);
}

export async function connectWallet() {
    if (!window.solana?.isPhantom) {
        throw new Error("Phantom not found. Install Phantom wallet.");
    }
    const res = await window.solana.connect();
    return res.publicKey.toString();
}

export async function paySol({ to, sol, memo = "" }) {
    assertWeb3();
    if (!window.solana?.isPhantom) throw new Error("Phantom not found.");

    const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = window.solanaWeb3;

    const connection = new Connection(RPC_URL, "confirmed");

    // Ensure connected
    const fromPubkey = window.solana.publicKey || (await window.solana.connect()).publicKey;

    const toPubkey = new PublicKey(to);
    const lamports = Math.round(Number(sol) * LAMPORTS_PER_SOL);

    if (!Number.isFinite(lamports) || lamports <= 0) {
        throw new Error("Invalid SOL amount.");
    }

    const tx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports
        })
    );

    // Optional memo (simple + cheap)
    if (memo && window.solanaWeb3.MemoProgram) {
        tx.add(window.solanaWeb3.MemoProgram.assign({ memo }));
    }

    tx.feePayer = fromPubkey;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;

    // Phantom signs + sends
    const signed = await window.solana.signAndSendTransaction(tx);
    const sig = signed.signature;

    // Confirm
    const conf = await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed"
    );

    if (conf.value?.err) {
        throw new Error("Transaction failed.");
    }

    return {
        signature: sig,
        explorer: `https://solscan.io/tx/${sig}`,
        from: fromPubkey.toString(),
        to,
        sol
    };
}

export function mountPayGate(options) {
    // options:
    // { buttonId, statusId, unlockId, to, sol, memo }
    const btn = document.getElementById(options.buttonId);
    const status = document.getElementById(options.statusId);
    const unlock = document.getElementById(options.unlockId);

    if (!btn || !status || !unlock) throw new Error("Missing elements for mountPayGate.");

    const setStatus = (s) => status.textContent = s;

    btn.addEventListener("click", async () => {
        try {
            btn.disabled = true;
            setStatus("connecting wallet…");

            const pubkey = await connectWallet();
            setStatus(`connected: ${shorten(pubkey)} | creating tx…`);

            const res = await paySol({
                to: options.to,
                sol: options.sol,
                memo: options.memo || "paygate"
            });

            setStatus(`confirmed ✅ tx: ${shorten(res.signature)} (open in solscan)`);
            status.innerHTML = `confirmed ✅ <a href="${res.explorer}" target="_blank" rel="noreferrer">${shorten(res.signature)}</a>`;

            unlock.style.display = "block";
        } catch (e) {
            setStatus(`error: ${e.message || e}`);
        } finally {
            btn.disabled = false;
        }
    });
}