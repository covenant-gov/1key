use aztec::macros::aztec;
pub mod test;
pub mod types;

#[aztec]
pub contract PasswordManager {
    // aztec library imports
    use aztec::{
        macros::{functions::{external, initializer, internal, view}, storage::storage},
        protocol_types::address::AztecAddress,
        state_vars::{PublicImmutable, PublicMutable, PrivateSet, Map},
    };
    use crate::types::password_entry_note::PasswordEntryNote;

    // @param admin The address of the admin
    // @param password_entries_map Maps hash of entry name (e.g., hashed("Bank Account 1")) to password entry note
    // @param entries Maps owner address to a set of entry names (e.g., "Bank Account 1", "Bank Account 2", etc.)
    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>,
        passwords: Map<AztecAddress, Map<Field, PrivateSet<PasswordEntryNote, Context>, Context>, Context>,
        entries: Map<AztecAddress, PrivateSet<Field, Context>, Context>,
    }

    /// @dev Initialize the contract
    /// @param admin The address of the admin
    // #[external("public")]
    // #[initializer]
    // fn constructor(admin: AztecAddress) {
    //     storage.admin.write(admin);
    // }

    /// @dev Retrieves the admin of the contract
    /// @return The admin of the contract
    // #[external("public")]
    // #[view]
    // fn get_admin() -> AztecAddress {
    //     storage.admin.read()
    // }
}
