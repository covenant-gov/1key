use aztec::macros::aztec;
pub mod test;
pub mod types;

#[aztec]
pub contract PasswordManager {
    // aztec library imports
    use aztec::{
        authwit::auth::assert_current_call_valid_authwit,
        macros::{functions::{external, initializer, internal, view}, storage::storage},
        protocol_types::address::AztecAddress,
        state_vars::{PublicMutable, PrivateMutable, PrivateSet, Map},
        context::PrivateContext,
    };
    use compressed_string::FieldCompressedString;
    use crate::types::password_entry_note::PasswordEntryNote;
    
    // @param admin The address of the admin
    // @param password_entries_map Maps hash of entry name (e.g., hashed("Bank Account 1")) to password entry note
    // @param entries Maps owner address to a set of entry names (e.g., "Bank Account 1", "Bank Account 2", etc.)
    #[storage]
    struct Storage<Context> {
        password_entries: Map<AztecAddress, PrivateSet<PasswordEntryNote, Context>, Context>,
    }

    #[external("private")]
    fn create_password_entry(label: FieldCompressedString, password: FieldCompressedString, owner: AztecAddress, randomness: Field) {
      _validate_private_auth(&mut context, owner);

        let note = PasswordEntryNote::new(label, password, owner, randomness);
    }



    #[contract_library_method]
    fn _validate_private_auth(context: &mut PrivateContext, from: AztecAddress) {
        let msg_sender = context.msg_sender().unwrap();
        if (!from.eq(msg_sender)) {
            assert_current_call_valid_authwit::<0>(context, from);
        }
    }
}
