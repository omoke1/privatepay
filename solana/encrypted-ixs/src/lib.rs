//! Private Pay Encrypted Instructions (Simplified)
//! 
//! This module contains MPC circuits for private payments.
//! More circuits will be added incrementally.

use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    // ============================================
    // PRIVATE BALANCE
    // ============================================

    /// Balance state for an account
    pub struct BalanceState {
        /// Current balance (encrypted)
        balance: u64,
        /// Account nonce for replay protection
        nonce: u64,
    }

    /// Initialize a new balance account with encrypted zero balance
    #[instruction]
    pub fn init_balance(mxe: Mxe) -> Enc<Mxe, BalanceState> {
        let initial_state = BalanceState {
            balance: 0,
            nonce: 0,
        };
        mxe.from_arcis(initial_state)
    }

    /// Deposit funds into a private balance
    /// 
    /// Adds the deposited amount to the encrypted balance.
    /// The deposit amount is public, but the resulting balance remains private.
    #[instruction]
    pub fn deposit(
        amount: u64, // Public deposit amount
        balance_state: Enc<Mxe, BalanceState>,
    ) -> Enc<Mxe, BalanceState> {
        let mut state = balance_state.to_arcis();
        state.balance += amount;
        state.nonce += 1;
        balance_state.owner.from_arcis(state)
    }
}
