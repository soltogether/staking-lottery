
import {  useWallet } from '@solana/wallet-adapter-react';
import {  WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { add_tokens, checkAccountATA, checkPlayerAccount, checkStakeAccountATA, 
  claim_prize, create_account_1, create_account_2, create_ticket, delete_account, 
  delete_ticket,get_ticket_info,get_winners_cheque_info,mark_ticket, stake, update_ticket, withdraw_tokens } from './services';
import { Ticket, WinnersChequeClient } from './models';


const Content: FC = () => {
    const wallet = useWallet();
  
    const [playerAccountInfo, setPlayerAccountInfo] = useState<any | null>(null);
    const [isWithdrawDisabled, setIsWithdrawDisabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isATACreated, setIsATACreated] = useState<boolean>(false);
    const [isShowTicketsPrizes, setIsShowTicketsPrizes] = useState<boolean>(false);
    const [isShowHome, setIsShowHome] = useState<boolean>(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [cheques, setCheques] = useState<WinnersChequeClient[]>([]);
    const [tokensStaked, setTokensStaked] = useState<string>("0");
    const [amount, setAmount] = useState('');
    const [amount1, setAmount1] = useState('');
    const [amount2, setAmount2] = useState('');
    const [amount3, setAmount3] = useState('');
    const [amount4, setAmount4] = useState('');
    const [usertokenaccount, setusertokenaccount] = useState('');
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);


    
    useEffect(() => {
      const fetchData = async () => {
        if (wallet.connected) {
          const addr:string = await checkPlayerAccount(wallet,setPlayerAccountInfo,setIsWithdrawDisabled);
          if(addr != ''){
            await checkAccountATA(addr,setIsATACreated);
            await checkStakeAccountATA(wallet,setTokensStaked,setusertokenaccount);
          }
        }
      };

      fetchData();
    }, [wallet.connected]);



    const handleNumberClick = (number: number) => {
      if (selectedNumbers.length < 3 && !selectedNumbers.includes(number)) {
        setSelectedNumbers([...selectedNumbers, number]);
      } else if (selectedNumbers.includes(number)) {
        // If the number is already selected, remove it
        setSelectedNumbers(selectedNumbers.filter((selected) => selected !== number));
      }
    };

    const handleStake = async () => {
      setIsLoading(true);
      const amountToStake = parseInt(amount, 10);

      await stake(wallet, amountToStake);

      await checkStakeAccountATA(wallet,setTokensStaked,setusertokenaccount);
      setIsLoading(false);
    };

    const handleCreateAccountStepOneClick = async () => {
      setIsLoading(true);
      await create_account_1(wallet);
      setIsLoading(false);
      await checkPlayerAccount(wallet, setPlayerAccountInfo, setIsWithdrawDisabled);
    };

    const handleCreateAccountStepTwoClick = async () => {
      setIsLoading(true);
      await create_account_2(wallet);
      await checkAccountATA(playerAccountInfo.user_address, setIsATACreated);
      setIsLoading(false);
    };

    const handleCreateTicket = async () => {
      const amountToStake = parseInt(amount1, 10);

      await create_ticket(wallet,amountToStake,selectedNumbers[0],selectedNumbers[1],selectedNumbers[2],playerAccountInfo.user_address);
    };

    const handleAddTokens = async () => {
      const amountToStake = parseInt(amount2, 10);
      await add_tokens(wallet,amountToStake);
      // After adding tokens, recheck player account info
      checkPlayerAccount(wallet,setPlayerAccountInfo,setIsWithdrawDisabled);
    };

    const handleWithDrawTokens = async () => {
      const amountToStake = parseInt(amount3, 10);

      await withdraw_tokens(wallet,amountToStake);
      // After withdrawing tokens, recheck player account info
      checkPlayerAccount(wallet,setPlayerAccountInfo,setIsWithdrawDisabled);
    };

    const handleDeleteAccount = async () => {
      await delete_account(wallet);
      // After creating or deleting the account, recheck player account info
      checkPlayerAccount(wallet,setPlayerAccountInfo,setIsWithdrawDisabled);
    };

    const handleMarkTicket = async (ticket_adress:string) => {
      await mark_ticket(wallet,ticket_adress);
    };

    const handleUpdateTicket = async (ticket_adress:string) => {
      const amountToStake = parseInt(amount4, 10);

      await update_ticket(wallet,amountToStake,selectedNumbers[0],selectedNumbers[1],selectedNumbers[2],playerAccountInfo.user_address,ticket_adress);
    };

    const handleDeleteTicket = async (ticket_adress:string) => {
      await delete_ticket(wallet,playerAccountInfo.user_address,ticket_adress);
    };

    const handleClaimPrize = async (cheque:string,week_no:number) => {
      await claim_prize(wallet,cheque,week_no);
    };

    const handleShowTickets = async () => {
      await get_ticket_info(wallet,setTickets);
      setIsShowTicketsPrizes(true);
      setIsShowHome(false);
    };

    const handleShowPrizes = async () => {
      await get_winners_cheque_info(wallet,setCheques);
      setIsShowTicketsPrizes(false);
      setIsShowHome(false);
    };

    const handleShowHome = async () => {
      setIsShowTicketsPrizes(false);
      setIsShowHome(true);
    };

    const handleStakeAmountChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
      setAmount(event.target.value);
    };
    const handleStakeAmountChange1 = (event: { target: { value: React.SetStateAction<string>; }; }) => {
      setAmount1(event.target.value);
    };
    const handleStakeAmountChange2 = (event: { target: { value: React.SetStateAction<string>; }; }) => {
      setAmount2(event.target.value);
    };
    const handleStakeAmountChange3 = (event: { target: { value: React.SetStateAction<string>; }; }) => {
      setAmount3(event.target.value);
    };
    const handleStakeAmountChange4 = (event: { target: { value: React.SetStateAction<string>; }; }) => {
      setAmount4(event.target.value);
    };

    return (
      <div>
        <WalletMultiButton />
        {wallet.connected && (
          <>
            {!playerAccountInfo ? (
              <>
                <button onClick={handleCreateAccountStepOneClick} disabled={isLoading}>
                  Create Account
                </button>
                <button onClick={handleStake} disabled={isLoading}>
                  Stake
                </button>
                <input
                 type="text"
                 placeholder="Enter stake amount"
                 value={amount}
                 onChange={handleStakeAmountChange}
                 disabled={isLoading}
                />
              </>
            ) : !isATACreated ? (
              <>
                <button onClick={handleCreateAccountStepTwoClick} disabled={isLoading}>
                  Create Account Step 2
                </button>
                <button onClick={handleStake} disabled={isLoading}>
                  Stake
                </button>
                <input
                  type="text"
                  placeholder="Enter stake amount"
                  value={amount}
                  onChange={handleStakeAmountChange}
                  disabled={isLoading}
                />
              </>
            ) : ( isShowHome ? 
              (<>
                  <div>
                    <p>Selected Numbers: {selectedNumbers.join(', ')}</p>
                    <p>Choose 3 numbers:</p>
                    <div>
                      {[...Array(17).keys()].map((number) => (
                        <button
                          key={number + 1}
                          onClick={() => handleNumberClick(number + 1)}
                          disabled={selectedNumbers.length === 3 && !selectedNumbers.includes(number + 1)}
                        >
                          {number + 1}
                        </button>
                      ))}
                    </div>
                      <button onClick={handleCreateTicket} disabled={isWithdrawDisabled}>Create Ticket</button>
                      <input
                        type="text"
                        placeholder="Token amount"
                        value={amount1}
                        onChange={handleStakeAmountChange1}
                        disabled={isLoading}
                      />
                  </div>
                <div>
                  <p>User Address: {playerAccountInfo.user_address}</p>
                  <p>Tokens Stored: {playerAccountInfo.token_locked.toString()}</p>
                  <p>Token Spent: {playerAccountInfo.token_spent.toString()}</p>
                  <p>Tokens staked: {tokensStaked}</p>
                </div>
                <button onClick={handleStake} disabled={isLoading}>Stake</button>
                <input
                 type="text"
                 placeholder="Enter stake amount"
                 value={amount}
                 onChange={handleStakeAmountChange}
                 disabled={isLoading}
                />
 
                <button onClick={handleAddTokens} disabled={isLoading}>Add Tokens</button>
                <input
                  type="text"
                  placeholder="add tokens"
                  value={amount2}
                  onChange={handleStakeAmountChange2}
                  disabled={isLoading}
                />
                <button onClick={handleWithDrawTokens} disabled={isWithdrawDisabled}>Withdraw Tokens</button>
                <input
                  type="text"
                  placeholder="withdraw tokens"
                  value={amount3}
                  onChange={handleStakeAmountChange3}
                  disabled={isLoading}
                />
                <button onClick={handleDeleteAccount} disabled={isLoading}>Delete Account</button>
                <div>
                <button onClick={handleShowTickets}>My Tickets</button>
                <button onClick={handleShowPrizes}>My Prizes</button>
                </div>
                <div>
                <p>User account: {playerAccountInfo.user_address}</p>
                <p>User token account: {usertokenaccount}</p>
                </div>
              </>) : (isShowTicketsPrizes?(
              <>
                <div>
                  <div>Tickets</div>
                  <button onClick={handleCreateTicket} disabled={isWithdrawDisabled}>Create New Ticket</button>
                  <div>
                  {tickets.map((ticket, index) => (
                    <div key={index}>
                      <p>Number 1: {ticket.number1}</p>
                      <p>Number 2: {ticket.number2}</p>
                      <p>Number 3: {ticket.number3}</p>
                      <p>Tokens in this ticket: {ticket.token_locked.toString()}</p>
                      <p>Created: {ticket.ticket_created.toString()}</p>
                      <p>Updated: {ticket.ticket_updated.toString()}</p>
                      <p>week_no_marked: {ticket.week_no_marked}</p>
                      <button onClick={()=>handleMarkTicket(ticket.user_address)} disabled={isWithdrawDisabled}>Mark Ticket</button>
                      <button onClick={()=>handleUpdateTicket(ticket.user_address)} disabled={isWithdrawDisabled}>Update Ticket</button>
                      <button onClick={()=>handleDeleteTicket(ticket.user_address)} disabled={isWithdrawDisabled}>Delete Ticket</button>
                    </div>
                  ))}
                  </div>
                <button onClick={handleShowHome}>Go back</button>
                </div>
              </>):(
              <>
                <div>Prizes
                <div>
                  {cheques.map((cheque, index) => (
                    <div key={index}>
                      <p>week_no: {cheque.week_no}</p>
                      <p>multiplier: {cheque.multiplier.toString()}</p>
                      <p>prize: {cheque.prize.toString()}</p>
                      <button onClick={()=>handleClaimPrize(cheque.user_address,cheque.week_no)} disabled={isWithdrawDisabled}>Claim Prize</button>
                    </div>
                  ))}
                  </div>
                <button onClick={handleShowHome}>Go back</button>
                </div>
              </>
              )
            )
          )}
        </>
      )}
    </div>
  );
};


export default Content;

