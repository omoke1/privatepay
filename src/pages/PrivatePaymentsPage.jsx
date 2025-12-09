import React, { useMemo, useState } from "react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import * as anchor from "@coral-xyz/anchor";
import { randomBytes } from "crypto";
import { useNavigate } from "react-router-dom";
import {
  awaitComputationFinalization,
  getClockAccAddress,
  getCompDefAccOffset,
  getCompDefAccAddress,
  getComputationAccAddress,
  getExecutingPoolAccAddress,
  getFeePoolAccAddress,
  getMempoolAccAddress,
  getArciumEnv,
} from "@arcium-hq/client";

import { ARCIUM_PROGRAM_ID, PRIVATE_PAY_PROGRAM_ID } from "@/lib/arcium/constants";
import { useArciumClient, getPrivatePayProgram } from "@/lib/arcium";
import { Icons } from "@/components/shared/Icons.jsx";

// SIGN_PDA_SEED from arcium-anchor derive_seed!(SignerAccount)
const SIGN_PDA_SEED = "SignerAccount";

export default function PrivatePaymentsPage() {
  const navigate = useNavigate();
  const { publicKey, connected, sendTransaction } = useWallet();
  const arciumClient = useArciumClient();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const provider = useMemo(() => {
    if (!arciumClient?.provider) return null;
    return arciumClient.provider;
  }, [arciumClient]);

  const program = useMemo(() => getPrivatePayProgram(provider), [provider]);

  const ensureReady = () => {
    if (!connected || !publicKey) {
      toast.error("Cüzdan bağlayın.");
      return false;
    }
    if (!arciumClient || !program) {
      toast.error("Arcium client ya da program hazır değil.");
      return false;
    }
    return true;
  };

  const deriveSignPda = () => {
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(SIGN_PDA_SEED)],
      ARCIUM_PROGRAM_ID
    );
    return pda;
  };

  const deriveBalancePda = (owner) => {
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("balance"), owner.toBuffer()],
      PRIVATE_PAY_PROGRAM_ID
    );
    return pda;
  };

  const deriveCompDef = (ixName) => {
    const offset = getCompDefAccOffset(ixName); // returns number
    return getCompDefAccAddress(PRIVATE_PAY_PROGRAM_ID, offset);
  };

  const handleInitBalance = async () => {
    if (!ensureReady()) return;
    setLoading(true);
    toast.loading("Init balance başlatılıyor...");
    try {
      const compOffset = new anchor.BN(randomBytes(8), "hex");
      const nonce = new anchor.BN(randomBytes(16), "hex");

      const env = getArciumEnv();
      const signPda = deriveSignPda();
      const balancePda = deriveBalancePda(publicKey);
      const compDef = deriveCompDef("init_balance");
      const mempool = getMempoolAccAddress(env.arciumClusterOffset);
      const executingPool = getExecutingPoolAccAddress(env.arciumClusterOffset);
      const clusterAccount = arciumClient.clusterAccount;
      const feePool = getFeePoolAccAddress(env.arciumClusterOffset);
      const clockAcc = getClockAccAddress(env.arciumClusterOffset);
      const computationAcc = getComputationAccAddress(env.arciumClusterOffset, compOffset);

      const tx = await program.methods
        .createBalanceAccount(compOffset, nonce)
        .accounts({
          payer: publicKey,
          signPdaAccount: signPda,
          mxeAccount: arciumClient.mxeAccount,
          mempoolAccount: mempool,
          executingPool,
          computationAccount: computationAcc,
          compDefAccount: compDef,
          clusterAccount: clusterAccount,
          poolAccount: feePool,
          clockAccount: clockAcc,
          systemProgram: anchor.web3.SystemProgram.programId,
          arciumProgram: ARCIUM_PROGRAM_ID,
          balanceAccount: balancePda,
        })
        .transaction();

      const sig = await sendTransaction(tx, provider.connection);
      await provider.connection.confirmTransaction(sig, "confirmed");
      toast.success(`Tx gönderildi: ${sig}`);

      toast.loading("MPC hesaplaması bekleniyor...");
      await awaitComputationFinalization(provider, compOffset, PRIVATE_PAY_PROGRAM_ID, "confirmed");
      toast.success("Init balance tamamlandı.");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Init balance hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!ensureReady()) return;
    if (!amount || Number(amount) <= 0) {
      toast.error("Geçerli bir miktar girin.");
      return;
    }
    setLoading(true);
    toast.loading("Deposit gönderiliyor...");
    try {
      const compOffset = new anchor.BN(randomBytes(8), "hex");
      const amountBn = new anchor.BN(amount);

      const env = getArciumEnv();
      const signPda = deriveSignPda();
      const balancePda = deriveBalancePda(publicKey);
      const compDef = deriveCompDef("deposit");
      const mempool = getMempoolAccAddress(env.arciumClusterOffset);
      const executingPool = getExecutingPoolAccAddress(env.arciumClusterOffset);
      const clusterAccount = arciumClient.clusterAccount;
      const feePool = getFeePoolAccAddress(env.arciumClusterOffset);
      const clockAcc = getClockAccAddress(env.arciumClusterOffset);
      const computationAcc = getComputationAccAddress(env.arciumClusterOffset, compOffset);

      const tx = await program.methods
        .depositFunds(compOffset, amountBn)
        .accounts({
          payer: publicKey,
          signPdaAccount: signPda,
          mxeAccount: arciumClient.mxeAccount,
          mempoolAccount: mempool,
          executingPool,
          computationAccount: computationAcc,
          compDefAccount: compDef,
          clusterAccount: clusterAccount,
          poolAccount: feePool,
          clockAccount: clockAcc,
          systemProgram: anchor.web3.SystemProgram.programId,
          arciumProgram: ARCIUM_PROGRAM_ID,
          balanceAccount: balancePda,
          owner: publicKey,
        })
        .transaction();

      const sig = await sendTransaction(tx, provider.connection);
      await provider.connection.confirmTransaction(sig, "confirmed");
      toast.success(`Tx gönderildi: ${sig}`);

      toast.loading("MPC hesaplaması bekleniyor...");
      await awaitComputationFinalization(provider, compOffset, PRIVATE_PAY_PROGRAM_ID, "confirmed");
      toast.success("Deposit tamamlandı.");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Deposit hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center py-16 px-4 md:px-10">
      <div className="relative flex flex-col gap-4 w-full max-w-md items-start justify-center bg-[#F9F9FA] rounded-[24px] p-6">
        <div className="flex items-center justify-between w-full mb-2">
          <h1 className="font-bold text-lg text-[#19191B]">Private Payments</h1>
          <Button
            onClick={() => navigate("/arcium")}
            className="bg-white rounded-full px-4 h-10 flex items-center gap-2"
            variant="flat"
          >
            <Icons.back className="size-4" />
            <span className="text-sm">Back</span>
          </Button>
        </div>

        <Card className="w-full p-4">
          <CardBody className="flex flex-col gap-4">
            <div className="text-xs text-gray-500">
              Arcium Program: {ARCIUM_PROGRAM_ID?.toBase58?.() ?? "auto"}
              <br />
              Private Pay Program: {PRIVATE_PAY_PROGRAM_ID?.toBase58?.()}
            </div>

            <Button color="secondary" onClick={handleInitBalance} isLoading={loading} isDisabled={!connected}>
              Init Balance Account
            </Button>

            <Input
              label="Deposit Amount (lamports)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <Button color="primary" onClick={handleDeposit} isLoading={loading} isDisabled={!connected}>
              Deposit
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

