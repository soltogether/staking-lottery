use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct UserAccount{//70

    pub user_address:String, //48
    pub user_address_length:u8, //1
    pub account_no:u16,
    pub register_no:u16,
    pub token_locked:u64,
    pub token_spent:u64,
    pub pda_bump:u8
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct Terms{

    pub is_init:u8,
    pub week_no:u16,
    pub rent:u64,
    pub minimum_ticket_amount:u64,
    pub minimum_multiplier_amount:u64,
    pub last_draw_time:u64,

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Register{

    pub is_init:u8,
    pub register_no:u16,
    pub player_registered:u16,

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct Ticket{//79

    pub user_address:String, //48
    pub user_address_length:u8, //49
    pub is_init:u8, //50
    pub number1:u8, //51
    pub number2:u8, //52
    pub number3:u8, //53
    pub ticket_created:u64, //61,
    pub ticket_updated:u64, //69
    pub token_locked:u64, //77
    pub week_no_marked:u16, //79

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct LuckyNumbers{//14

    pub is_init:u8,
    pub number1:u8,
    pub number2:u8,
    pub number3:u8,
    pub week_no:u16,
    pub draw_time:u64,

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct NumberOfWinners{//12

    pub is_init:u8,
    pub week_no:u16,
    pub number_of_winners:u8,
    pub total_multipliers:u64,

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct WinnersCheck{//59

    pub user_address:String, //48
    pub user_address_length:u8, //1
    pub week_no:u16,
    pub multiplier:u64,

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct PrizeFund{//19

    pub is_init:u8,
    pub week_no:u16,
    pub total_prize:u64,
    pub prize_per_multiplier:u64,

}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub struct Init{

    pub bump:u8,
    pub no:u16,
    pub lamports:u64,

}
