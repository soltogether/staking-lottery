use crate::instruction::GameInstruction;
use crate::state::{UserAccount,Terms, Register, Ticket, LuckyNumbers, NumberOfWinners, WinnersCheck, Init, PrizeFund};
use borsh::{BorshDeserialize, BorshSerialize};
use core::panic;
use std::str::FromStr;
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint::ProgramResult,
  pubkey::Pubkey,
  sysvar::{clock::Clock, Sysvar,},
  system_instruction,
  program::{invoke_signed,invoke},
  program_pack::Pack,
  //system_program::ID,
  msg,

  
};

use spl_token::instruction::{transfer,close_account};
use spl_token::state::Account;



pub struct Processor;
impl Processor {
  pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
  ) -> ProgramResult {
    let instruction: GameInstruction = GameInstruction::unpack(instruction_data)?;

    match instruction {

      GameInstruction::CreateTicket {ticket} => {
        Self::create_ticket(accounts,program_id,ticket)
      }
      GameInstruction::MarkTicket {} => {
        Self::mark_ticket(accounts,program_id)
      }
      GameInstruction::DeleteTicket {} => {
        Self::delete_ticket(accounts)
      }
      GameInstruction::UpdateTicket {ticket} => {
        Self::update_ticket(accounts,program_id,ticket)
      }
      GameInstruction::CreateAccount {useraccount} => {
        Self::create_account(accounts,program_id,useraccount)
      }
      GameInstruction::AddTokens {useraccount} => {
        Self::add_tokens(accounts,useraccount)
      }
      GameInstruction::WithdrawTokens {useraccount} => {
        Self::withdraw_tokens(accounts,useraccount)
      }
      GameInstruction::DeleteAccount {useraccount} => {
        Self::delete_account(accounts, useraccount)
      }
      GameInstruction::ClaimPrize {} => {
        Self::claim_prize(accounts)
      }
      GameInstruction::UpdateTerms {terms} => {
        Self::update_terms(accounts, terms)
      }
      GameInstruction::CreateRegister {init} => {
        Self::create_register(accounts,init)
      }
      GameInstruction::Drawing {lucky} => {
        Self::draw(accounts, lucky)
      }
      GameInstruction::CalculatePrize {} => {
        Self::calculate_prize(accounts)
      }
      GameInstruction::CreateNW {init} => {
        Self::create_number_of_winners_account(accounts,init)
      }
      GameInstruction::CreateLN {init} => {
        Self::create_lucky_numbers_account(accounts,init)
      }
      GameInstruction::CreatePF {} => {
        Self::create_prize_fund_account(accounts)
      }
      GameInstruction::WalletTest {user_acc} => {
        Self::wallet_test(accounts,program_id,user_acc)
      }
    }
  }



  fn create_ticket(
    accounts: &[AccountInfo],
    program_id:&Pubkey,
    ticket:Ticket) -> ProgramResult {
      

      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let ticket_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;


      //create ticket_account on client side

      if terms_account.owner != program_id{panic!()}
      if terms_account.is_writable{panic!()}
      if !user_address.is_signer{panic!()}
      msg!("1");


      let terms: Terms = Terms::try_from_slice(&terms_account.data.borrow())?;
      msg!("2");
      let mut user_account_data: UserAccount = UserAccount::try_from_slice(&user_account_pda.data.borrow())?;
      msg!("3");
      msg!("{:?}",ticket_account.owner);
      msg!("{:?}",ticket_account.data.borrow_mut()[0]);


      if terms.is_init != 1{panic!()}
      if ticket_account.data.borrow_mut()[0] != 0{panic!()}
      msg!("2");

      let clock: Clock= Clock::get()?;
      let current_time: u64 = clock.unix_timestamp as u64;

      let offset: usize = user_account_data.user_address_length as usize;
      let user_address_str: &String = &user_account_data.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();
      if &user_address_check != user_address.key{panic!()}

      msg!("3");

      if terms.minimum_ticket_amount > ticket.token_locked{panic!()}
      if terms.minimum_ticket_amount > user_account_data.token_locked{panic!()}
      
      if ticket.token_locked > user_account_data.token_locked{panic!()}

      user_account_data.token_spent += ticket.token_locked;
      if user_account_data.token_spent > user_account_data.token_locked{panic!()}

      let arr = vec![ticket.number1,ticket.number2,ticket.number3,];
      fn filter_uniq(vec: Vec<u8>) -> Vec<u8> {
        let mut uniq = vec
            .into_iter()
            .collect::<Vec<u8>>();
        uniq.sort();
        uniq.dedup();
        uniq
     }
     msg!("4");


     let n =filter_uniq(arr).len();
     if n!=3{panic!()}  


      let new_ticket_data: Ticket = Ticket{
        user_address:user_account_data.user_address.to_string(), //48
        user_address_length:user_account_data.user_address_length, //1
        is_init:1,
        number1:ticket.number1,
        number2:ticket.number2,
        number3:ticket.number3,
        ticket_created:current_time,
        ticket_updated:current_time,
        token_locked:ticket.token_locked,
        week_no_marked:0
      };


      user_account_data.serialize(&mut &mut user_account_pda.data.borrow_mut()[..])?;
      new_ticket_data.serialize(&mut &mut ticket_account.data.borrow_mut()[..])?;


    Ok(())
  }  

  fn mark_ticket(
    accounts: &[AccountInfo],
    program_id:&Pubkey) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let ticket_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let lucky_numbers_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let number_of_winners_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let winners_check: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let mut ticket_data: Ticket = Ticket::try_from_slice(&ticket_account.data.borrow())?;
      msg!("1");
      let lucky_numbers: LuckyNumbers = LuckyNumbers::try_from_slice(&lucky_numbers_account.data.borrow())?;
      msg!("2");
      let mut number_of_winners: NumberOfWinners = NumberOfWinners::try_from_slice(&number_of_winners_account.data.borrow())?;
      msg!("3");
      let terms: Terms = Terms::try_from_slice(&terms_account.data.borrow())?;
      msg!("4");

      let offset2: usize = ticket_data.user_address_length as usize;
      let user_address_str2: &String = &ticket_data.user_address[..offset2].to_string();
      let user_address_check2: Pubkey = Pubkey::from_str(&user_address_str2).unwrap();
      if &user_address_check2 != user_address.key{panic!()}
      msg!("2");


      if !user_address.is_signer{panic!()}

      if lucky_numbers.is_init != 1{panic!()}
      if number_of_winners.is_init != 1{panic!()}
      if terms.is_init != 1{panic!()}
      msg!("3");

      if lucky_numbers_account.owner != program_id{panic!()}
      if number_of_winners_account.owner != program_id{panic!()}
      if terms_account.owner != program_id{panic!()}
      msg!("4");

      if terms_account.is_writable{panic!()}
      if lucky_numbers_account.is_writable{panic!()}
      msg!("5");

      if lucky_numbers.week_no != number_of_winners.week_no{panic!()}
      if lucky_numbers.week_no <= ticket_data.week_no_marked{panic!()}

      msg!("6");

      let arr: Vec<u8> =vec![ticket_data.number1,ticket_data.number2,ticket_data.number3,
      lucky_numbers.number1,lucky_numbers.number2,lucky_numbers.number3,];

      fn filter_uniq(vec: Vec<u8>) -> Vec<u8> {
        let mut uniq: Vec<u8> = vec
            .into_iter()
            .collect::<Vec<u8>>();
        uniq.sort();
        uniq.dedup();
        uniq
      }

      let n: usize =filter_uniq(arr).len();
      let x:u8 = n as u8;
      msg!("7");
   
      if x != 3{panic!()}

      if ticket_data.is_init != 1{panic!()}

      let clock: Clock= Clock::get()?;
      let current_time: u64 = clock.unix_timestamp as u64;

      if ticket_data.ticket_updated > lucky_numbers.draw_time{panic!()}

      if current_time - lucky_numbers.draw_time > 259200{panic!()}

      let m: u64 = 1+((ticket_data.token_locked - terms.minimum_ticket_amount)/terms.minimum_multiplier_amount);


      ticket_data.week_no_marked = lucky_numbers.week_no;
      number_of_winners.number_of_winners += 1;
      number_of_winners.total_multipliers += m;
      msg!("8");



      let w: WinnersCheck = WinnersCheck{
        user_address:ticket_data.user_address.to_string(), //48
        user_address_length:ticket_data.user_address_length, //1
        week_no:ticket_data.week_no_marked,
        multiplier:m,
      };

      w.serialize(&mut &mut winners_check.data.borrow_mut()[..])?;
      ticket_data.serialize(&mut &mut ticket_account.data.borrow_mut()[..])?;
      number_of_winners.serialize(&mut &mut number_of_winners_account.data.borrow_mut()[..])?;


    Ok(())
  }

  fn delete_ticket(
    accounts: &[AccountInfo]) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let ticket_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;


      if !user_address.is_signer{panic!()}
      msg!("1");


      let mut user_account_data: UserAccount = UserAccount::try_from_slice(&user_account_pda.data.borrow())?;
      let ticket_data: Ticket = Ticket::try_from_slice(&ticket_account.data.borrow())?;


      let offset: usize = user_account_data.user_address_length as usize;
      let user_address_str: &String = &user_account_data.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();
      if &user_address_check != user_address.key{panic!()}
      msg!("4");

      let offset2: usize = ticket_data.user_address_length as usize;
      let user_address_str2: &String = &ticket_data.user_address[..offset2].to_string();
      let user_address_check2: Pubkey = Pubkey::from_str(&user_address_str2).unwrap();
      if &user_address_check2 != user_address.key{panic!()}
      msg!("1");

      user_account_data.token_spent = user_account_data.token_spent - ticket_data.token_locked;

    let value: u64 = **ticket_account.lamports.borrow(); 

    **ticket_account.lamports.borrow_mut() -= value;
    **user_address.lamports.borrow_mut() += value;
    msg!("2");


      user_account_data.serialize(&mut &mut user_account_pda.data.borrow_mut()[..])?;

      


    Ok(())
  }  

  fn update_ticket(
    accounts: &[AccountInfo],
    program_id:&Pubkey,
    ticket:Ticket) -> ProgramResult {
      
      msg!("1");

      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let ticket_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;


      //create ticket_account on client side

      if terms_account.owner != program_id{panic!()}
      if terms_account.is_writable{panic!()}
      if !user_address.is_signer{panic!()}

      msg!("2");

      let terms: Terms = Terms::try_from_slice(&terms_account.data.borrow())?;
      let mut user_account_data: UserAccount = UserAccount::try_from_slice(&user_account_pda.data.borrow())?;
      let mut ticket_data: Ticket = Ticket::try_from_slice(&ticket_account.data.borrow())?;

      if terms.is_init != 1{panic!()}
      if ticket_data.is_init != 1{panic!()}

      let clock: Clock= Clock::get()?;
      let current_time: u64 = clock.unix_timestamp as u64;
      msg!("3");

      let offset: usize = user_account_data.user_address_length as usize;
      let user_address_str: &String = &user_account_data.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();
      if &user_address_check != user_address.key{panic!()}
      msg!("4");

      let offset2: usize = ticket_data.user_address_length as usize;
      let user_address_str2: &String = &ticket_data.user_address[..offset2].to_string();
      let user_address_check2: Pubkey = Pubkey::from_str(&user_address_str2).unwrap();
      if &user_address_check2 != user_address.key{panic!()}

      msg!("5");

      let arr: Vec<u8> = vec![ticket.number1,ticket.number2,ticket.number3,];
      fn filter_uniq(vec: Vec<u8>) -> Vec<u8> {
        let mut uniq = vec
            .into_iter()
            .collect::<Vec<u8>>();
        uniq.sort();
        uniq.dedup();
        uniq
     }

     let n: usize =filter_uniq(arr).len();
     if n!=3{panic!()}  

     msg!("6");

     if terms.minimum_ticket_amount > ticket.token_locked{panic!()} //ticket lock cant be less than allowed
     if ticket.token_locked > user_account_data.token_locked{panic!()} // ticket lock cant be more than current tokens

     //token investment is reduced
     if ticket_data.token_locked > ticket.token_locked{

      user_account_data.token_spent -= ticket_data.token_locked - ticket.token_locked;
      ticket_data.token_locked = ticket.token_locked;

     }

     //token investment is increased
     if ticket_data.token_locked < ticket.token_locked{

      user_account_data.token_spent += ticket.token_locked - ticket_data.token_locked;
      ticket_data.token_locked = ticket.token_locked;

     }
     msg!("7");


     if user_account_data.token_spent > user_account_data.token_locked{panic!()} //cant spend more than current tokens

     ticket_data.number1 = ticket.number1;
     ticket_data.number2 = ticket.number2;
     ticket_data.number3 = ticket.number3;

     ticket_data.ticket_updated = current_time;


      user_account_data.serialize(&mut &mut user_account_pda.data.borrow_mut()[..])?;
      ticket_data.serialize(&mut &mut ticket_account.data.borrow_mut()[..])?;


    Ok(())
  }  

  fn create_account(
    accounts: &[AccountInfo],
    program_id:&Pubkey,
    useraccount:UserAccount) -> ProgramResult {

      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let register_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;


      if !user_address.is_signer{panic!()}

      if register_account.owner != program_id{panic!()}
      if terms_account.owner != program_id{panic!()}


      let mut register: Register = Register::try_from_slice(&register_account.data.borrow())?;
      let terms: Terms = Terms::try_from_slice(&terms_account.data.borrow())?;

      if terms.is_init != 1{panic!()}

      register.player_registered += 1;


      let mut user_address_holder: String = String::from("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      let user_address_str: &String = &user_address.key.to_string();
      let offset: usize = user_address_str.len();
      user_address_holder.replace_range(..offset, &user_address_str);

      let user_account_data: UserAccount = UserAccount{
        user_address:user_address_holder, //48
        user_address_length:offset as u8, //1
        account_no:register.player_registered,
        register_no:register.register_no,
        token_locked:0,
        token_spent:0,
        pda_bump:useraccount.pda_bump
      };

      invoke_signed(
        &system_instruction::create_account(  
            &user_address.key, 
            &user_account_pda.key,
            terms.rent,
            70,
            &program_id
        ),
        &[
          user_address.clone(), 
          user_account_pda.clone(),
        ],
        &[&[useraccount.user_address.as_ref(), &[useraccount.pda_bump]]],
      )?;

      user_account_data.serialize(&mut &mut user_account_pda.data.borrow_mut()[..])?;
      register.serialize(&mut &mut register_account.data.borrow_mut()[..])?;

    Ok(())
  }


  fn withdraw_tokens(
    accounts: &[AccountInfo],
    useraccount:UserAccount) -> ProgramResult {


      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let token_mint: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let token_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      if user_account_pda_ata.owner!=&spl_token::id(){panic!()}
      if user_ata.owner!=&spl_token::id(){panic!()}
      if !user_address.is_signer{panic!()}
      msg!("1");

      //let ver = process_instruction();

      if token_mint.is_writable{panic!()}

      let mint: Pubkey = Pubkey::from_str("4bJcU8L7o4yBaKKoCH499hrwuiqt9ZAg8wfv2vnAGzsc").unwrap();
      if token_mint.key != &mint{panic!()}
      msg!("3");

      let v: Account = Account::unpack_from_slice(&user_account_pda_ata.data.borrow())?;
      let u: Account = Account::unpack_from_slice(&user_ata.data.borrow())?;

      if u.amount < useraccount.token_locked{panic!()}

      msg!("2");



      if user_account_pda.key != &v.owner{panic!()}
      if user_address.key != &u.owner{panic!()}
      if token_mint.key != &v.mint{panic!()}
      if token_mint.key != &u.mint{panic!()}
      msg!("3");

      let mut user_account_data: UserAccount = UserAccount::try_from_slice(&user_account_pda.data.borrow())?;

      let offset: usize = user_account_data.user_address_length as usize;
      let user_address_str: &String = &user_account_data.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();
      if &user_address_check != user_address.key{panic!()}
      msg!("4");

      user_account_data.token_locked -= useraccount.token_locked;
      if user_account_data.token_spent > user_account_data.token_locked{panic!()}

      let n2: &String = &user_account_data.account_no.to_string();
      let n1: &String = &user_account_data.register_no.to_string();

      let a1: String = String::from("R");
      let a2: String = String::from("N");
      let mut seed: String =String::new();
      seed += &a1;
      seed += &n1;
      seed += &a2;
      seed += &n2;
      msg!("4");

      let trans_ix = transfer( &token_program.key,
        &user_account_pda_ata.key, 
        &user_ata.key, 
        &user_account_pda.key, 
        &[&user_account_pda.key], 
        useraccount.token_locked)?;

      //create PDA - user account
      invoke_signed(
        &trans_ix,
        &[
          user_account_pda_ata.clone(), 
          user_account_pda.clone(),
          user_ata.clone(),
          token_program.clone(),
        ],
        &[&[seed.as_bytes(), &[useraccount.pda_bump]]],
      )?;

      user_account_data.serialize(&mut &mut user_account_pda.data.borrow_mut()[..])?;

      

    Ok(())
  }

  fn add_tokens(
    accounts: &[AccountInfo],
    useraccount:UserAccount) -> ProgramResult {

      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let token_mint: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let token_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      if user_account_pda_ata.owner!=&spl_token::id(){panic!()}
      if user_ata.owner!=&spl_token::id(){panic!()}
      if !user_address.is_signer{panic!()}

      if token_mint.is_writable{panic!()}

      let mint: Pubkey = Pubkey::from_str("4bJcU8L7o4yBaKKoCH499hrwuiqt9ZAg8wfv2vnAGzsc").unwrap();
      if token_mint.key != &mint{panic!()}

      let v: Account = Account::unpack_from_slice(&user_account_pda_ata.data.borrow())?;
      let u: Account = Account::unpack_from_slice(&user_ata.data.borrow())?;

      if user_account_pda.key != &v.owner{panic!()}
      if user_address.key != &u.owner{panic!()}
      if token_mint.key != &v.mint{panic!()}
      if token_mint.key != &u.mint{panic!()}

      let mut user_account_data: UserAccount = UserAccount::try_from_slice(&user_account_pda.data.borrow())?;

      let offset: usize = user_account_data.user_address_length as usize;
      let user_address_str: &String = &user_account_data.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();
      if &user_address_check != user_address.key{panic!()}


      let trans_ix = transfer( &token_program.key,
        &user_ata.key, 
        &user_account_pda_ata.key, 
        &user_address.key, 
        &[&user_address.key], 
        useraccount.token_locked)?;

      invoke(&trans_ix,&[token_program.clone(),user_ata.clone(),user_account_pda_ata.clone(),token_mint.clone(), user_address.clone()])?; 

      user_account_data.token_locked += useraccount.token_locked;


      user_account_data.serialize(&mut &mut user_account_pda.data.borrow_mut()[..])?;

    Ok(())
  }

  fn delete_account(
    accounts: &[AccountInfo],
    useraccount:UserAccount) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda_ata: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let token_program: &AccountInfo<'_> = next_account_info(accounts_iter)?;


      if !user_address.is_signer{panic!()}

      let user_account_data: UserAccount = UserAccount::try_from_slice(&user_account_pda.data.borrow())?;


      let offset: usize = user_account_data.user_address_length as usize;
      let user_address_str: &String = &user_account_data.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();

      if user_address.key != &user_address_check {panic!()}

      if user_account_data.token_spent != 0 {panic!()}

      let close_ix = close_account(
        &token_program.key, 
        &user_account_pda_ata.key, 
        &user_address.key, 
        &user_account_pda.key,
        &[user_account_pda.key], 
        )?;

        let n2: &String = &useraccount.account_no.to_string();
        let n1: &String = &useraccount.register_no.to_string();
  
        let a1: String = String::from("R");
        let a2: String = String::from("N");
        let mut seed: String =String::new();
        seed += &a1;
        seed += &n1;
        seed += &a2;
        seed += &n2;
        
        invoke_signed(
          &close_ix,
          &[
            token_program.clone(), 
            user_address.clone(), 
            user_account_pda_ata.clone(), 
            user_account_pda.clone(),
          ],
          &[&[seed.as_bytes(), &[useraccount.pda_bump]]],
        )?;


      let value: u64 = **user_account_pda.lamports.borrow(); 

      **user_account_pda.lamports.borrow_mut() -= value;
      **user_address.lamports.borrow_mut() += value;

    Ok(())
  }
  
  fn claim_prize(
    accounts: &[AccountInfo]) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      let user_address: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let winners_check_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let prize_fund_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let prize_fund: PrizeFund = PrizeFund::try_from_slice(&prize_fund_account.data.borrow())?;
      let winners_check: WinnersCheck = WinnersCheck::try_from_slice(&winners_check_account.data.borrow())?;

      if winners_check.week_no != prize_fund.week_no{panic!()}
      if prize_fund.is_init != 1{panic!()}

      let offset: usize = winners_check.user_address_length as usize;
      let user_address_str: &String = &winners_check.user_address[..offset].to_string();
      let user_address_check: Pubkey = Pubkey::from_str(&user_address_str).unwrap();
      if &user_address_check != user_address.key{panic!()}


      let prize: u64 = prize_fund.prize_per_multiplier*winners_check.multiplier;
      let value: u64 = **winners_check_account.lamports.borrow(); 


      **winners_check_account.lamports.borrow_mut() -= value;
      **user_address.lamports.borrow_mut() += value;

      **prize_fund_account.lamports.borrow_mut() -= prize;
      **user_address.lamports.borrow_mut() += prize;

      winners_check.serialize(&mut &mut winners_check_account.data.borrow_mut()[..])?;


    Ok(())
  }
  
  fn update_terms(
    accounts: &[AccountInfo],
    terms: Terms) -> ProgramResult {

      
    let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


    let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
    let a: &AccountInfo<'_> = next_account_info(accounts_iter)?;


    let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();


    if a.key != &authority_address{ panic!()}

 
    if !a.is_signer {panic!()}

    

    terms.serialize(&mut &mut terms_account.data.borrow_mut()[..])?;

    Ok(())
  }  

  fn create_register(
    accounts: &[AccountInfo],
    init:Init) -> ProgramResult {

      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      
      let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let register_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();
  
      if authority.key != &authority_address {panic!()}
      if !authority.is_signer{panic!()}


        let reg: Register = Register{
          is_init:1,
          register_no:init.no,
          player_registered:0
        };

        reg.serialize(&mut &mut register_account.data.borrow_mut()[..])?;

    Ok(())
  }  

  fn draw(
    accounts: &[AccountInfo],
    lucky: LuckyNumbers) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      
      let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let lucky_numbers_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let mut terms: Terms = Terms::try_from_slice(&terms_account.data.borrow())?;

      let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();
  
      if authority.key != &authority_address {panic!()}
      if !authority.is_signer{panic!()}


      let clock: Clock= Clock::get()?;
      let current_time: u64 = clock.unix_timestamp as u64;

        let lucky: LuckyNumbers = LuckyNumbers{
          is_init:1,
          number1:lucky.number1,
          number2:lucky.number2,
          number3:lucky.number3,
          week_no:lucky.week_no,
          draw_time:current_time,
        };

        terms.week_no += 1;

        lucky.serialize(&mut &mut lucky_numbers_account.data.borrow_mut()[..])?;
        terms.serialize(&mut &mut terms_account.data.borrow_mut()[..])?;



    Ok(())
  }  

  fn calculate_prize(
    accounts: &[AccountInfo],) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      
      let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let number_of_winners_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let prize_fund_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();
  
      if authority.key != &authority_address {panic!()}

      if !authority.is_signer{panic!()}
      

      let number_of_winners: NumberOfWinners = NumberOfWinners::try_from_slice(&number_of_winners_account.data.borrow())?;
      let mut prize_fund: PrizeFund = PrizeFund::try_from_slice(&prize_fund_account.data.borrow())?;

      let value: u64 = **prize_fund_account.lamports.borrow(); 
      prize_fund.total_prize = value - 10000000;

      if number_of_winners.week_no != prize_fund.week_no{panic!()}

      if prize_fund.is_init != 1{panic!()}

      if number_of_winners.is_init != 1{panic!()}
      msg!("1");

      let mut multiplier:u64 = 1;
      {msg!("multiplier = {}",multiplier);}
      if number_of_winners.total_multipliers != 0{

        {msg!("total_prize = {}",prize_fund.total_prize);}
        {msg!("total_multipliers = {}",number_of_winners.total_multipliers);}

        multiplier = number_of_winners.total_multipliers;

      {msg!("multiplier = {}",multiplier);}
    }
      let prize_per_multiplier: u64 = prize_fund.total_prize/multiplier;

      {msg!("prize_per_multiplier = {}",prize_per_multiplier);}


      prize_fund.prize_per_multiplier = prize_per_multiplier;
      prize_fund.week_no = number_of_winners.week_no;
      {msg!("prize_per_multiplier = {}",prize_fund.prize_per_multiplier);}

      prize_fund.serialize(&mut &mut prize_fund_account.data.borrow_mut()[..])?;


    Ok(())
  }

  fn create_number_of_winners_account(
    accounts: &[AccountInfo],
    init:Init) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      
      let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let number_of_winners: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();
  
            if authority.key != &authority_address {panic!()}
      if !authority.is_signer{panic!()}



        let nw: NumberOfWinners = NumberOfWinners{
          is_init:1,
          week_no:init.no,
          number_of_winners:0,
          total_multipliers:0,
        };

        nw.serialize(&mut &mut number_of_winners.data.borrow_mut()[..])?;



    Ok(())
  }

  fn create_lucky_numbers_account(
    accounts: &[AccountInfo],
    init:Init) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      
      let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let lucky_numbers_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();
  
            if authority.key != &authority_address {panic!()}
      if !authority.is_signer{panic!()}



        let lucky: LuckyNumbers = LuckyNumbers{
          is_init:1,
          number1:0,
          number2:0,
          number3:0,
          week_no:init.no,
          draw_time:0,
        };

        lucky.serialize(&mut &mut lucky_numbers_account.data.borrow_mut()[..])?;



    Ok(())
  }

  fn create_prize_fund_account(
    accounts: &[AccountInfo]) -> ProgramResult {
      
      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();

      
      let authority: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let prize_fund_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      let authority_address: Pubkey = Pubkey::from_str("Aj3DTsnryTryVtuAjRhWqfhBf6zZ7he5aQGtUk1hnGGw").unwrap();
      
            if authority.key != &authority_address {panic!()}
      if !authority.is_signer{panic!()}



        let prize: PrizeFund = PrizeFund{
          is_init:1,
          week_no:0,
          total_prize:0,
          prize_per_multiplier:0,
        };

        prize.serialize(&mut &mut prize_fund_account.data.borrow_mut()[..])?;



    Ok(())
  }

  fn wallet_test(
    accounts: &[AccountInfo],
    program_id: &Pubkey, 
    user_acc:UserAccount) -> ProgramResult {

      let accounts_iter: &mut std::slice::Iter<'_, AccountInfo<'_>> = &mut accounts.iter();


      let wallet: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let user_account_pda: &AccountInfo<'_> = next_account_info(accounts_iter)?;
      let terms_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

      if !wallet.is_signer{
        panic!()
      }

      let terms: Terms = Terms::try_from_slice(&terms_account.data.borrow())?;


      if user_acc.pda_bump > 50{panic!()}

      let seed = "Y".to_string();

      invoke_signed(
        &system_instruction::create_account( 
            &wallet.key, 
            &user_account_pda.key,
            terms.rent,
            70,
            &program_id
        ),
        &[
          wallet.clone(), 
          user_account_pda.clone(),
        ],
        &[&[seed.as_ref(), &[255]]],
      )?;

    Ok(())
  }

}



//minimum stake
//Ticket per sol - multiplier
//timestamp - 3 days





/*
if !account.is_writable {
      return Err(NotWritable.into());
    }
    if account.owner != program_id {
      return Err(ProgramError::IncorrectProgramId);
    }
*/
