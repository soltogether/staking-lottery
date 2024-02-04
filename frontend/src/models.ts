

  export  class UserAccount {
    user_address: string = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    user_address_length: number = 0;
    account_no: number = 0;
    register_no: number = 0;
    token_locked: number = 0;
    token_spent: number = 0;
    pda_bump: number = 0;
  
    constructor(fields: {
      user_address: string;
      user_address_length: number;
      account_no: number;
      register_no: number;
      token_locked: number;
      token_spent: number;
      pda_bump: number;
    } | undefined = undefined) {
      if (fields) {
        this.user_address = fields.user_address;
        this.user_address_length = fields.user_address_length;
        this.account_no = fields.account_no;
        this.register_no = fields.register_no;
        this.token_locked = fields.token_locked;
        this.token_spent = fields.token_spent;
        this.pda_bump = fields.pda_bump;
      }
    }
  }
  export    const userAccountSchema = {
    struct: {
      user_address: 'string',
      user_address_length: 'u8',
      account_no: 'u16',
      register_no: 'u16',
      token_locked: 'u64',
      token_spent: 'u64',
      pda_bump: 'u8',
    },
  };
  export    class Register {
    is_init: number = 0;
    register_no: number = 0;
    player_registered: number = 0;
  
    constructor(fields: {
      is_init: number;
      register_no: number;
      player_registered: number;
    } | undefined = undefined) {
      if (fields) {
        this.is_init = fields.is_init;
        this.register_no = fields.register_no;
        this.player_registered = fields.player_registered;
      }
    }
  }
  export    const registerSchema = {
    struct: {
      is_init: 'u8',
      register_no: 'u16',
      player_registered: 'u16',
    },
  };
  export    class Ticket {
    user_address: string = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    user_address_length: number = 0;
    is_init: number = 0;
    number1: number = 0;
    number2: number = 0;
    number3: number = 0;
    ticket_created: number = 0;
    ticket_updated: number = 0;
    token_locked: number = 0;
    week_no_marked: number = 0;
  
    constructor(fields: {
      user_address: string;
      user_address_length: number;
      is_init: number;
      number1: number;
      number2: number;
      number3: number;
      ticket_created: number;
      ticket_updated: number;
      token_locked: number;
      week_no_marked: number;
    } | undefined = undefined) {
      if (fields) {
        this.user_address = fields.user_address;
        this.user_address_length = fields.user_address_length;
        this.is_init = fields.is_init;
        this.number1 = fields.number1;
        this.number2 = fields.number2;
        this.number3 = fields.number3;
        this.ticket_created = fields.ticket_created;
        this.ticket_updated = fields.ticket_updated;
        this.token_locked = fields.token_locked;
        this.week_no_marked = fields.week_no_marked;
      }
    }
  }
  export   const ticketSchema= {

    struct: {
        user_address:'string',
        user_address_length:'u8',
        is_init:'u8',
        number1:'u8',
        number2:'u8',
        number3:'u8',
        ticket_created:'u64',
        ticket_updated:'u64',
        token_locked:'u64',
        week_no_marked:'u16',
    },
  };
  export    class Terms {
    is_init: number = 0;
    week_no: number = 0;
    rent: number = 0;
    minimum_ticket_amount: number = 0;
    minimum_multiplier_amount: number = 0;
    last_draw_time: number = 0;
  
    constructor(fields: {
      is_init: number;
      week_no: number;
      rent: number;
      minimum_ticket_amount: number;
      minimum_multiplier_amount: number;
      last_draw_time: number;
    } | undefined = undefined) {
      if (fields) {
        this.is_init = fields.is_init;
        this.week_no = fields.week_no;
        this.rent = fields.rent;
        this.minimum_ticket_amount = fields.minimum_ticket_amount;
        this.minimum_multiplier_amount = fields.minimum_multiplier_amount;
        this.last_draw_time = fields.last_draw_time;
      }
    }
  }
  export   const termsSchema={
  
    struct: {
        is_init:'u8',
        week_no:'u16',
        rent:'u64',
        minimum_ticket_amount:'u64',
        minimum_multiplier_amount:'u64',
        last_draw_time:'u64',
  
    },
  };
  export   class WinnersCheque {
    user_address: string = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    user_address_length: number = 0;
    week_no: number = 0;
    multiplier: number = 0;
  
    constructor(fields: {
      user_address: string;
      user_address_length: number;
      week_no: number;
      multiplier: number;
    } | undefined = undefined) {
      if (fields) {
        this.user_address = fields.user_address;
        this.user_address_length = fields.user_address_length;
        this.week_no = fields.week_no;
        this.multiplier = fields.multiplier;
      }
    }
  }
  export   const winnersChequeSchema={

    struct: {
        user_address:'string',
        user_address_length:'u8',
        week_no:'u16',
        multiplier:'u64',
    },
  };
  export   class WinnersChequeClient {
    user_address: string = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    user_address_length: number = 0;
    week_no: number = 0;
    multiplier: number = 0;
    prize: number = 0;
  
    constructor(fields: {
      user_address: string;
      user_address_length: number;
      week_no: number;
      multiplier: number;
      prize: number;

    } | undefined = undefined) {
      if (fields) {

        this.user_address = fields.user_address;
        this.user_address_length = fields.user_address_length;
        this.week_no = fields.week_no;
        this.multiplier = fields.multiplier;
        this.prize = fields.prize;
      }
    }
  }
  export   const winnersChequeSchemaClient={

    struct: {

        week_no:'u16',
        multiplier:'u64',
        prize:'u64'
    },
  };
  export class PrizeFund {
    is_init: number = 0;
    week_no: number = 0;
    total_prize: number = 0;
    prize_per_multiplier: number = 0;
  
    constructor(fields: {
      is_init: number;
      week_no: number;
      total_prize: number;
      prize_per_multiplier: number;
    } | undefined = undefined) {
      if (fields) {
        this.is_init = fields.is_init;
        this.week_no = fields.week_no;
        this.total_prize = fields.total_prize;
        this.prize_per_multiplier = fields.prize_per_multiplier;
      }
    }
  }
  export const prizeFundSchema = {
    struct: {
      is_init: 'u8',
      week_no: 'u16',
      total_prize: 'u64',
      prize_per_multiplier: 'u64',
    },
  };