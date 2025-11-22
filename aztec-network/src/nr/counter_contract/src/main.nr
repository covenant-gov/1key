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
        note::note_header::NoteHeader,
    };
    use field_compressed_string::FieldCompressedString;
    use crate::types::non_transferable_note::PasswordEntryNote;

    // @param admin The address of the admin
    // @param password_entries_map Maps hash of entry name (e.g., "Bank Account 1") to password entry note
    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>,
        password_entries_map: Map<Field, PasswordEntryNote, Context>,
    }

    /// @dev Initialize the contract
    /// @param admin The address of the admin
    #[external("public")]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        storage.admin.write(admin);
    }

    /// @dev Retrieves the admin of the contract
    /// @return The admin of the contract
    #[external("public")]
    fn get_admin() -> AztecAddress {
        storage.admin.read()
    }
}
