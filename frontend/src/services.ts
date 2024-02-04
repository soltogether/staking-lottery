import { WalletContextState } from '@solana/wallet-adapter-react';
import {UserAccount,userAccountSchema,registerSchema,Ticket,ticketSchema,prizeFundSchema,
  termsSchema,winnersChequeSchema,WinnersChequeClient } from './models';
import {programID,token_mint,terms_account,authority_address, stake_pool} from './publickeys';
import { encode } from '@faustbrian/node-base58';
import { getAssociatedTokenAddress, getAccount,createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, TransactionInstruction, SystemProgram, TransactionMessage, VersionedTransaction, Keypair, LAMPORTS_PER_SOL, Transaction, SendTransactionError } from '@solana/web3.js';
import * as borsh from 'borsh';
import { depositSol } from '@solana/spl-stake-pool';

export const connection= new Connection("https://api.testnet.solana.com","confirmed");

const encodo = (schema: borsh.Schema, obj: any): Uint8Array => borsh.serialize(schema, obj);
const decodo = (schema: borsh.Schema, buffer: Uint8Array): any => borsh.deserialize(schema, buffer);

export const stake = async (wallet:WalletContextState,amount:number) => {


  try {
    const stake_amount = LAMPORTS_PER_SOL * amount;
  

    const { instructions, signers } = await depositSol(connection,stake_pool,wallet.publicKey!,stake_amount);
    
  
    const message = new TransactionMessage({
      instructions: [instructions[0],instructions[1],instructions[2]],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
      }).compileToV0Message();
  
  
      const tx = new VersionedTransaction(message);
      
      tx.sign(signers);

  
      const signature = await wallet.sendTransaction(tx,connection);
  
      const latestBlockHash = await connection.getLatestBlockhash();

  
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

  } catch (error) {
    
  }



}
export const create_account_1 = async (wallet:WalletContextState) =>{

    //const reg_no=Math.floor(Math.random() * 5) + 1;
    const reg_no=1;

    const seed = "REG" + reg_no.toString();


    const register_account = await PublicKey.createWithSeed(authority_address,seed,programID);
    const r = await connection.getAccountInfo(register_account);
    const decodedRegister = decodo(registerSchema, r!.data);

    const player_no = decodedRegister.player_registered+1;

    const user_account_seed = "R"+ reg_no.toString() + "N"+player_no.toString();

    const user_account = PublicKey.findProgramAddressSync([Buffer.from(user_account_seed)],programID);


    let useraccount = new UserAccount();

    useraccount.pda_bump = user_account[1];
    useraccount.user_address = user_account_seed;

    const encodedUserAccount = encodo(userAccountSchema, useraccount);


    let concated = Uint8Array.of(121,...encodedUserAccount);


    const ix = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:false,isWritable:true,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_account[0]},
        {isSigner:false,isWritable:false,pubkey:terms_account},
        {isSigner:false,isWritable:true,pubkey:register_account},
        {isSigner:false,isWritable:true,pubkey:SystemProgram.programId},
      ],
      data:Buffer.from(concated)});


      const message = new TransactionMessage({
      instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
      }).compileToV0Message();


      const tx = new VersionedTransaction(message);


      const signature = await wallet.sendTransaction(tx,connection);

      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

}
export const create_account_2= async (wallet:WalletContextState) =>{


    const p = wallet.publicKey!.toString();
  
    const base = encode(p);
  
    const user_accounts_array = await connection.getProgramAccounts(
      programID,
      {
        filters: [
          {
            dataSize: 70, // number of bytes
          },
          {
            memcmp: {
              offset: 4, // for rent
              bytes: base,
            },
          },
        ],
      }
    );


    const user_account = user_accounts_array[0].pubkey;


    let user_account_ata = await getAssociatedTokenAddress(token_mint,user_account,true);
    let ix = createAssociatedTokenAccountInstruction(wallet.publicKey!,user_account_ata,user_account,token_mint,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)



      const message = new TransactionMessage({
      instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash

      }).compileToV0Message();
  
  
    
      const tx = new VersionedTransaction(message);

      const signature = await wallet.sendTransaction(tx,connection);

      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
}
export const delete_account = async (wallet:WalletContextState) =>{

    const p = wallet.publicKey!.toString();
  
    const base = encode(p);
  
    const user_accounts_array = await connection.getProgramAccounts(
      programID,
      {
        filters: [
          {
            dataSize: 70, // number of bytes
          },
          {
            memcmp: {
              offset: 4, // for rent
              bytes: base,
            },
          },
        ],
      }
    );
  
    const user_account = user_accounts_array[0].pubkey;
    const user_account_data = decodo(userAccountSchema,user_accounts_array[0].account.data);
  
    let useraccount = new UserAccount();
  
    useraccount.pda_bump = user_account_data.pda_bump;
    useraccount.register_no = user_account_data.register_no;
    useraccount.account_no = user_account_data.account_no;
  
    let encoded = encodo(userAccountSchema,useraccount);
    let concated = Uint8Array.of(137,...encoded);
    let user_account_ata = await getAssociatedTokenAddress(token_mint,user_account,true,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)
  
  
    const ix = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:true,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_account},
        {isSigner:false,isWritable:true,pubkey:user_account_ata},
        {isSigner:false,isWritable:false,pubkey:TOKEN_PROGRAM_ID},
      ],
      data:Buffer.from(concated)});
  
      const message = new TransactionMessage({
        instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      let signature = await wallet.sendTransaction(tx,connection);

      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
  
}
export const withdraw_tokens = async (wallet:WalletContextState,amount:number) =>{

    const p = wallet.publicKey!.toString();
  
    const base = encode(p);
  
    const user_accounts_array = await connection.getProgramAccounts(
      programID,
      {
        filters: [
          {
            dataSize: 70, // number of bytes
          },
          {
            memcmp: {
              offset: 4, // for rent
              bytes: base,
            },
          },
        ],
      }
    );
  
  
    const user_account = user_accounts_array[0].pubkey;
  
    const user_account_data = decodo(userAccountSchema,user_accounts_array[0].account.data);
  
  
    //const token_lock = LAMPORTS_PER_SOL*50;
    const token_lock = LAMPORTS_PER_SOL*amount;
  
    let useraccount = new UserAccount();
  
    useraccount.token_locked = token_lock;
    useraccount.pda_bump = user_account_data.pda_bump;
  
    let encoded = encodo(userAccountSchema,useraccount);
      
    let concated = Uint8Array.of(129,...encoded);
  
    let user_ata = await getAssociatedTokenAddress(token_mint,wallet.publicKey!)
  
    let user_account_ata = await getAssociatedTokenAddress(token_mint,user_account,true,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)
  
  
    const ix = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:true,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_ata},
        {isSigner:false,isWritable:true,pubkey:user_account},
        {isSigner:false,isWritable:true,pubkey:user_account_ata},
        {isSigner:false,isWritable:false,pubkey:token_mint},
        {isSigner:false,isWritable:false,pubkey:TOKEN_PROGRAM_ID},
  
      ],
      data:Buffer.from(concated)});
  
      const message = new TransactionMessage({
        instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      let signature = await wallet.sendTransaction(tx,connection);

            const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
  
}
export const add_tokens = async (wallet:WalletContextState,amount:number,) =>{
  
    const p = wallet.publicKey!.toString();
  
    const base = encode(p);
  
    const user_accounts_array = await connection.getProgramAccounts(
      programID,
      {
        filters: [
          {
            dataSize: 70, // number of bytes
          },
          {
            memcmp: {
              offset: 4, // for rent
              bytes: base,
            },
          },
        ],
      }
    );
  
    const user_account = user_accounts_array[0].pubkey;
  
    const user_account_data = decodo(userAccountSchema,user_accounts_array[0].account.data);
  
  
    const token_lock = LAMPORTS_PER_SOL * amount;
  
    let useraccount = new UserAccount();
  
    useraccount.token_locked = token_lock;
    useraccount.pda_bump = user_account_data.pda_bump;
  
    let encoded = encodo(userAccountSchema,useraccount);
      
    let concated = Uint8Array.of(125,...encoded);
  
    let user_ata = await getAssociatedTokenAddress(token_mint,wallet.publicKey!)
  
    let user_account_ata = await getAssociatedTokenAddress(token_mint,user_account,true,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID)
  
  
    const ix = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:true,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_ata},
        {isSigner:false,isWritable:true,pubkey:user_account},
        {isSigner:false,isWritable:true,pubkey:user_account_ata},
        {isSigner:false,isWritable:false,pubkey:token_mint},
        {isSigner:false,isWritable:false,pubkey:TOKEN_PROGRAM_ID},
  
      ],
      data:Buffer.from(concated)});
  
      const message = new TransactionMessage({
        instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      let signature = await wallet.sendTransaction(tx,connection);

      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
  
}
export const create_ticket= async (wallet:WalletContextState,amount:number,number1:number,number2:number,number3:number,user_account:string) =>{

  try {
    
    const user_account_pda = new PublicKey(user_account);
    const ticket_account = Keypair.generate();
  
    let ticket = new Ticket();
  
    ticket.token_locked = LAMPORTS_PER_SOL*amount;
    ticket.number1 = number1;
    ticket.number2 = number2;
    ticket.number3 = number3;
  
    let encoded = encodo(ticketSchema,ticket);
  
    console.log(encoded.length);
    let concated =Uint8Array.of(0,...encoded);
  
  
    const ix_1 = new TransactionInstruction(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!, // funder
        newAccountPubkey: ticket_account.publicKey,
        lamports: LAMPORTS_PER_SOL * 0.01, // 0.1 SOL
        space: encoded.length,
        programId: programID,
      })
    );
  
    const ix_2 = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:false,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_account_pda},
        {isSigner:false,isWritable:true,pubkey:ticket_account.publicKey},
        {isSigner:false,isWritable:false,pubkey:terms_account},
      ],
      data:Buffer.from(concated)});
  
      const message = new TransactionMessage({
        instructions: [ix_1,ix_2],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      tx.sign([ticket_account]);

      let signature = await wallet.sendTransaction(tx,connection);

      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

  } catch (error) {
    
  }
  
  
}
export const mark_ticket= async (wallet:WalletContextState,ticket_address:string) =>{
    
  const ticket_account = new PublicKey(ticket_address);

  
    const terms_accout_info = await connection.getAccountInfo(terms_account);
    const terms = decodo(termsSchema,terms_accout_info!.data);
  
    console.log("terms week "+terms.week_no);
  
    const ln_seed = "LN" + terms.week_no.toString();
    const nw_seed = "NW" + terms.week_no.toString();
  
    const lucky_numbers_account = await PublicKey.createWithSeed(authority_address, ln_seed, programID);
    const number_of_winners_account = await PublicKey.createWithSeed(authority_address , nw_seed, programID);
      
    console.log(lucky_numbers_account.toString());
    console.log(number_of_winners_account.toString());
  
    const winners_check = Keypair.generate();
  
    const ix_1 = new TransactionInstruction(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!, // funder
        newAccountPubkey: winners_check.publicKey,
        lamports: LAMPORTS_PER_SOL * 0.01, // 0.1 SOL
        space: 59,
        programId: programID,
      })
    );
  
    const ix_2 = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:false,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:ticket_account},
        {isSigner:false,isWritable:false,pubkey:lucky_numbers_account},
        {isSigner:false,isWritable:true,pubkey:number_of_winners_account},
        {isSigner:false,isWritable:false,pubkey:terms_account},
        {isSigner:false,isWritable:true,pubkey:winners_check.publicKey},
      ],
      data:Buffer.from([17])});
  
      const message = new TransactionMessage({
        instructions: [ix_1,ix_2],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      let signature = await wallet.sendTransaction(tx,connection);

            const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
  
}
export const delete_ticket= async (wallet:WalletContextState,user_account_address:string,ticket_address:string) =>{
  
  const ticket_account = new PublicKey(ticket_address);
  const user_account = new PublicKey(user_account_address);
  
  
    const ix = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:true,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_account},
        {isSigner:false,isWritable:true,pubkey:ticket_account},
  
      ],
      data:Buffer.from([73])});
  
      const message = new TransactionMessage({
        instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      let signature = await wallet.sendTransaction(tx,connection);

            const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
  
}
export const update_ticket= async (wallet:WalletContextState,amount:number,number1:number,number2:number,number3:number,user_account_address:string,ticket_address:string) =>{
  


    const ticket_account = new PublicKey(ticket_address);
    const user_account = new PublicKey(user_account_address);
  
    let ticket = new Ticket();
  
  
    ticket.token_locked = LAMPORTS_PER_SOL * amount;
    ticket.number1 = number1;
    ticket.number2 = number2;
    ticket.number3 = number3;
  
    let encoded = encodo(ticketSchema,ticket);
  
      
    let concated =Uint8Array.of(78,...encoded);
  
  
    const ix = new TransactionInstruction({
      programId:programID,
      keys:[
        {isSigner:true,isWritable:true,pubkey:wallet.publicKey!},
        {isSigner:false,isWritable:true,pubkey:user_account},
        {isSigner:false,isWritable:true,pubkey:ticket_account},
        {isSigner:false,isWritable:false,pubkey:terms_account},
  
      ],
      data:Buffer.from(concated)});
  
      const message = new TransactionMessage({
        instructions: [ix],
        payerKey: wallet.publicKey!,
        recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    
      }).compileToV0Message();
    
      const tx = new VersionedTransaction(message);

      let signature = await wallet.sendTransaction(tx,connection);

            const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
  
}
export const claim_prize = async (wallet:WalletContextState,winners_cheque:string,week_no:number) =>{


  const winners_check_account = new PublicKey(winners_cheque)

  const seed = "PF" + week_no.toString();

  const prize_fund_account = await PublicKey.createWithSeed(authority_address,seed,programID);

  console.log("prize fund "+prize_fund_account.toString());

  const ix = new TransactionInstruction({
    programId:programID,
    keys:[
      {isSigner:true,isWritable:true,pubkey:wallet.publicKey!},
      {isSigner:false,isWritable:true,pubkey:winners_check_account},
      {isSigner:false,isWritable:true,pubkey:prize_fund_account},
    ],
    data:Buffer.from([203])});

    const message = new TransactionMessage({
      instructions: [ix],
      payerKey: wallet.publicKey!,
      recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);

    let signature = await wallet.sendTransaction(tx,connection);

    const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

}
export const get_ticket_info = async (wallet:WalletContextState, setTickets:any) =>{

  const p = wallet.publicKey!.toString();

  const base = encode(p);

  const accounts = await connection.getProgramAccounts(
    programID,
    {
      filters: [
        {
          dataSize: 79, // number of bytes
        },
        {
          memcmp: {
            offset: 4, // for rent
            bytes: base,
          },
        },
      ],
    }
  );

  const ticketsArray: Ticket[] = [];

  for (let index = 0; index < accounts.length; index++) {
    const ticket = accounts[index];
    const data = decodo(ticketSchema,ticket.account.data);
    data.user_address = accounts[index].pubkey.toString();
    ticketsArray.push(data);
  }

  setTickets(ticketsArray);

}
export const get_winners_cheque_info = async (wallet:WalletContextState, setChecques:any) =>{

  const p = wallet.publicKey!.toString();

  const base = encode(p);

  const accounts = await connection.getProgramAccounts(
    programID,
    {
      filters: [
        {
          dataSize: 59, // number of bytes
        },
        {
          memcmp: {
            offset: 4, // for rent
            bytes: base,
          },
        },
      ],
    }
  );

  const chequesArray: WinnersChequeClient[] = [];

  for (let index = 0; index < accounts.length; index++) {

    const cheque = accounts[index];
    const data = decodo(winnersChequeSchema,cheque.account.data);

    const chequeClient = new WinnersChequeClient();
    chequeClient.multiplier=data.multiplier;
    chequeClient.week_no=data.week_no;
    chequeClient.user_address = accounts[index].pubkey.toString();

    const seed = "PF" + data.week_no.toString();
    const prize_fund_account = await PublicKey.createWithSeed(authority_address,seed,programID);
    const account_info  = await connection.getAccountInfo(prize_fund_account);
    const prize_fund_data = decodo(prizeFundSchema,account_info!.data);

    chequeClient.prize = data.multiplier*prize_fund_data.prize_per_multiplier;

    
    chequesArray.push(chequeClient);

  }

  setChecques(chequesArray);

}
export const checkPlayerAccount = async (wallet: WalletContextState, setPlayerAccountInfo: any, setIsWithdrawDisabled: any) => {
    const p = wallet.publicKey!.toString();
    const base = encode(p);
  
    const userAccountsArray = await connection.getProgramAccounts(
      programID,
      {
        filters: [
          {
            dataSize: 70, // number of bytes
          },
          {
            memcmp: {
              offset: 4, // for rent
              bytes: base,
            },
          },
        ],
      }
    );
  let addr = '';
    if (userAccountsArray.length > 0) {
      const userAccountData = decodo(userAccountSchema, userAccountsArray[0].account.data);
      userAccountData.user_address = userAccountsArray[0].pubkey.toString();
      addr = userAccountsArray[0].pubkey.toString();
      addr = addr.slice(0, userAccountData.user_address_length);
      setPlayerAccountInfo(userAccountData);
      setIsWithdrawDisabled(userAccountData.token_locked == 0);
      
    } else {
      setPlayerAccountInfo(null);
      setIsWithdrawDisabled(true);
    }
    return addr;
};
export const checkAccountATA =async (user_account_address: string,setIsATACreated:any, ) => {

    const user_account = new PublicKey(user_account_address);

    let user_account_ata = await getAssociatedTokenAddress(token_mint,user_account,true);

    let account_info = await getAccount(connection,user_account_ata);

    setIsATACreated(account_info.isInitialized);

}
export const checkStakeAccountATA =async (wallet: WalletContextState, setTokensStaked:any,setusertokenaccount:any) => {


  let user_account_ata = await getAssociatedTokenAddress(token_mint,wallet.publicKey!,true);
  setusertokenaccount(user_account_ata.toString());

  let account_info = await getAccount(connection,user_account_ata);
  setTokensStaked(Math.floor((account_info.amount/1000000000)).toString());

}

