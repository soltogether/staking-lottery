use crate::error::MailError::InvalidInstruction;
use crate::state::{UserAccount,Ticket,Terms,Init,LuckyNumbers};
use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

#[derive(Debug, PartialEq)]
pub enum GameInstruction {

  CreateTicket{ticket: Ticket},
  MarkTicket,
  DeleteTicket,
  UpdateTicket{ticket: Ticket},
  CreateAccount{useraccount: UserAccount},
  AddTokens{useraccount:UserAccount},
  WithdrawTokens{useraccount:UserAccount},
  DeleteAccount{useraccount:UserAccount},
  ClaimPrize,
  UpdateTerms{terms:Terms},
  CreateRegister{init:Init},
  Drawing{lucky:LuckyNumbers},
  CalculatePrize,
  CreateNW{init:Init},
  CreateLN{init:Init},
  CreatePF,
  WalletTest{user_acc:UserAccount}
}

impl GameInstruction {
  pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
    let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;
    
    Ok(match tag {

      0 => Self::CreateTicket{
        ticket: Ticket::try_from_slice(&rest)?,
      },
      17 => Self::MarkTicket,
      73 => Self::DeleteTicket,
      78 => Self::UpdateTicket{
        ticket: Ticket::try_from_slice(&rest)?,
      },
      121 => Self::CreateAccount{
        useraccount: UserAccount::try_from_slice(&rest)?,
      },
      125 => Self::AddTokens{
        useraccount: UserAccount::try_from_slice(&rest)?,
      },
      129 => Self::WithdrawTokens{
        useraccount: UserAccount::try_from_slice(&rest)?,
      },
      137 => Self::DeleteAccount{
        useraccount: UserAccount::try_from_slice(&rest)?,
      },
      203 => Self::ClaimPrize,
      173 => Self::UpdateTerms{
        terms: Terms::try_from_slice(&rest)?,
      },
      194 => Self::CreateRegister{
        init: Init::try_from_slice(&rest)?,
      },
      247 => Self::CalculatePrize,
      255 => Self::Drawing{
        lucky: LuckyNumbers::try_from_slice(&rest)?,
      },
      50 => Self::CreateNW{
        init: Init::try_from_slice(&rest)?,
      },
      51 => Self::CreateLN{
        init: Init::try_from_slice(&rest)?,
      },
      52 => Self::CreatePF,
      100 => Self::WalletTest{
        user_acc: UserAccount::try_from_slice(&rest)?,
      },

      _ => return Err(InvalidInstruction.into()),
    })
  }
}

//drawing - chainlink
//stake - pool - activate account and put a timestamp
//unstake - pool - deactivate account and put a timestamp
//delete account
//create account
//update numbers //timestamp
//mark your Ticket
//claim prize