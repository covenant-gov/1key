use aztec::macros::aztec;
pub mod test;
pub mod types;

#[aztec]
pub contract PasswordManager {
    // aztec library imports
    use aztec::{
        authwit::auth::assert_current_call_valid_authwit,
        macros::{functions::{external, internal}, storage::storage},
        messages::message_delivery::MessageDelivery,
        note::{
            constants::MAX_NOTES_PER_PAGE, note_viewer_options::NoteViewerOptions,
        },
        protocol_types::address::AztecAddress,
        state_vars::{PublicMutable, PrivateSet, Map},
        context::PrivateContext,
    };
    use compressed_string::FieldCompressedString;
    use crate::types::password_entry_note::PasswordEntryNote;
    
    #[storage]
    struct Storage<Context> {
        password_entries: Map<AztecAddress, PrivateSet<PasswordEntryNote, Context>, Context>,
        uid: Map<Field, PublicMutable<bool, Context>, Context>,
    }

    #[external("private")]
    fn create_password_entry(
      label: FieldCompressedString,
      password: FieldCompressedString,
      owner: AztecAddress,
      id: Field,
      randomness: Field,
    ) {
        _validate_private_auth(&mut context, owner);

        PasswordManager::at(context.this_address()).set_uid_exists(id).enqueue(&mut context);

        storage.password_entries.at(owner)
          .insert(PasswordEntryNote::new(label, password, owner, id, randomness))
          .emit(owner, MessageDelivery.CONSTRAINED_ONCHAIN);
    }

    #[external("utility")]
    unconstrained fn get_password_entry_ids(
      owner: AztecAddress,
      page_index: u32,
    ) -> ([Field; MAX_NOTES_PER_PAGE], bool) {
      let offset = page_index * MAX_NOTES_PER_PAGE;
      let mut options = NoteViewerOptions::new();
      let passwords = storage.password_entries.at(owner).view_notes(options.set_offset(offset));
      let mut ids = [0; MAX_NOTES_PER_PAGE];
            for i in 0..options.limit {
            if i < passwords.len() {
              ids[i] = passwords.get_unchecked(i).get_id();
            }
          }
          let page_limit_reached = passwords.len() == options.limit;
          (ids, page_limit_reached)
    }

    #[external("public")]
    #[internal]
    fn set_uid_exists(id: Field) {
        assert(!storage.uid.at(id).read(), "id already exists");
        storage.uid.at(id).write(true);
    }

    #[contract_library_method]
    fn _validate_private_auth(
      context: &mut PrivateContext, 
      from: AztecAddress,
    ) {
        let msg_sender = context.msg_sender().unwrap();
        if (!from.eq(msg_sender)) {
            assert_current_call_valid_authwit::<0>(context, from);
        }
    }
}
