use aztec::macros::aztec;
pub mod test;
pub mod types;

#[aztec]
pub contract PasswordManager {
    // --- Aztec Library Imports ---
    use aztec::{
        authwit::auth::assert_current_call_valid_authwit,
        macros::{functions::{external, internal}, storage::storage},
        messages::message_delivery::MessageDelivery,
        note::{
            constants::MAX_NOTES_PER_PAGE,
            note_getter_options::NoteGetterOptions,
            note_interface::NoteProperties,
            note_viewer_options::NoteViewerOptions,
        },
        protocol_types::address::AztecAddress,
        state_vars::{PublicMutable, PrivateSet, Map},
        context::PrivateContext,
        utils::comparison::Comparator,
    };
    use compressed_string::FieldCompressedString;
    use crate::types::password_entry_note::PasswordEntryNote;

    // --- Storage ---
    
    /// @param password_entries A map from address to a private set of password entries owned by that address
    /// @param shared_password_entries A map from address to a private set of password entries shared with that address
    /// @param uid A map from password entry ID to a boolean indicating if the ID exists
    #[storage]
    struct Storage<Context> {
        password_entries: Map<AztecAddress, PrivateSet<PasswordEntryNote, Context>, Context>,
        shared_password_entries: Map<AztecAddress, PrivateSet<PasswordEntryNote, Context>, Context>,
        uid: Map<Field, PublicMutable<bool, Context>, Context>,
    }

    /** ==========================================================
     * ========================= PRIVATE =========================
     * ======================================================== */

    /// @notice Creates a new encrypted password entry for the owner
    /// @dev Inserts a password entry note into the owner's private set and marks the ID as existing
    /// @param label The label/name of the password entry
    /// @param password The password value
    /// @param owner The address that owns this password entry
    /// @param id The unique identifier of this password entry
    /// @param randomness Random value to protect against note hash preimage attacks
    #[external("private")]
    fn create_password_entry(
      label: FieldCompressedString,
      password: FieldCompressedString,
      owner: AztecAddress,
      id: Field,
      randomness: Field,
    ) {
        _validate_private_auth(&mut context, owner);
        PasswordManager::at(context.this_address()).set_uid_exists_internal(id).enqueue(&mut context);
        storage.password_entries.at(owner)
          .insert(PasswordEntryNote::new(label, password, owner, id, randomness))
          .emit(owner, MessageDelivery.CONSTRAINED_ONCHAIN);
    }

    /// @notice Updates an existing password entry with new label and password
    /// @dev Removes the old password entry and inserts a new one with the same ID
    /// @param label The new label/name of the password entry
    /// @param password The new encrypted password value
    /// @param owner The address of the owner of the password entry
    /// @param id The unique identifier of the password entry to update
    /// @param randomness Random value to protect against note hash preimage attacks
    #[external("private")]
    fn update_password_entry(
      label: FieldCompressedString,
      password: FieldCompressedString,
      owner: AztecAddress,
      id: Field,
      randomness: Field,
    ) {
      _validate_private_auth(&mut context, owner);
      _delete_password_entry_internal(storage.password_entries.at(owner), id);
      storage.password_entries.at(owner)
        .insert(PasswordEntryNote::new(label, password, owner, id, randomness))
        .emit(owner, MessageDelivery.CONSTRAINED_ONCHAIN);
    }

    /// @notice Deletes a password entry by removing it from the owner's private set
    /// @dev Nullifies the password entry note and marks the ID as not existing
    /// @param owner The address of the owner of the password entry
    /// @param id The unique identifier of the password entry to delete
    #[external("private")]
    fn delete_password_entry(
      owner: AztecAddress,
      id: Field,
    ) {
        _validate_private_auth(&mut context, owner);
        _delete_password_entry_internal(storage.password_entries.at(owner), id);
        PasswordManager::at(context.this_address()).set_uid_not_exists_internal(id).enqueue(&mut context);
    }

    /// @notice Shares a password entry with another address
    /// @dev Retrieves the password entry from owner's set and creates a shared copy for the recipient
    /// @param owner The address of the owner who is sharing the password entry
    /// @param id The unique identifier of the password entry to share
    /// @param recipient The address that will receive the shared password entry
    #[external("private")]
    fn share_password_entry(
      owner: AztecAddress,
      id: Field,
      recipient: AztecAddress,
    ) {
        _validate_private_auth(&mut context, owner);
    
        let notes = storage.password_entries.at(owner).get_notes(NoteGetterOptions::new()
          .select(PasswordEntryNote::properties().id, Comparator.EQ, id)
          .set_limit(1)
        );
        assert(notes.len() == 1, "password entry not found");
        let shared_note = notes.get_unchecked(0).note.share(recipient);
        
        storage.shared_password_entries.at(recipient)
          .insert(shared_note)
          .emit(recipient, MessageDelivery.CONSTRAINED_ONCHAIN);
    }

    /// @notice Revokes access to a shared password entry
    /// @dev Removes the shared password entry from the recipient's private set
    /// @param owner The address of the owner who is revoking access
    /// @param id The unique identifier of the password entry to unshare
    /// @param recipient The address that will lose access to the shared password entry
    #[external("private")]
    fn unshare_password_entry(
      owner: AztecAddress,
      id: Field,
      recipient: AztecAddress,
    ) {
        _validate_private_auth(&mut context, owner);
        _delete_password_entry_internal(storage.shared_password_entries.at(recipient), id);
    }

    /** ==========================================================
     * ===================== UNCONSTRAINED ======================
     * ======================================================== */

    /// @notice Retrieves a paginated list of password entry IDs for an owner
    /// @dev Returns an array of password entry IDs and a boolean indicating if more pages exist
    /// @param owner The address of the owner whose password entry IDs to retrieve
    /// @param page_index The page index (0-based) for pagination
    /// @return A tuple containing an array of password entry IDs and a boolean indicating if the page limit was reached
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

    /// @notice Retrieves a paginated list of shared password entry IDs for a recipient
    /// @dev Returns an array of password entry IDs that have been shared with the recipient
    /// @param recipient The address of the recipient whose shared password entry IDs to retrieve
    /// @param page_index The page index (0-based) for pagination
    /// @return A tuple containing an array of password entry IDs and a boolean indicating if the page limit was reached
    #[external("utility")]
    unconstrained fn get_sharedpassword_entry_ids(
      recipient: AztecAddress,
      page_index: u32,
    ) -> ([Field; MAX_NOTES_PER_PAGE], bool) {
      let offset = page_index * MAX_NOTES_PER_PAGE;
      let mut options = NoteViewerOptions::new();
      let passwords = storage.shared_password_entries.at(recipient).view_notes(options.set_offset(offset));
      let mut ids = [0; MAX_NOTES_PER_PAGE];
      for i in 0..options.limit {
        if i < passwords.len() {
          ids[i] = passwords.get_unchecked(i).get_id();
        }
      }
      let page_limit_reached = passwords.len() == options.limit;
      (ids, page_limit_reached)
    }

    /// @notice Retrieves a paginated list of shared password entry IDs filtered by the original owner
    /// @dev Returns an array of password entry IDs that were shared by a specific owner with the recipient
    /// @param recipient The address of the recipient whose shared password entry IDs to retrieve
    /// @param owner The address of the original owner to filter by
    /// @param page_index The page index (0-based) for pagination
    /// @return A tuple containing an array of password entry IDs and a boolean indicating if the page limit was reached
    #[external("utility")]
    unconstrained fn get_sharedpassword_entry_ids_by_owner(
      recipient: AztecAddress,
      owner: AztecAddress,
      page_index: u32,
    ) -> ([Field; MAX_NOTES_PER_PAGE], bool) {
      let offset = page_index * MAX_NOTES_PER_PAGE;
      let mut options = NoteViewerOptions::new();
      let passwords = storage.shared_password_entries.at(recipient).view_notes(options.set_offset(offset));
      let mut ids = [0; MAX_NOTES_PER_PAGE];
      for i in 0..options.limit {
        if i < passwords.len() {
          if (passwords.get_unchecked(i).get_owner() == owner) {
            ids[i] = passwords.get_unchecked(i).get_id();
          }
        }
      }
      let page_limit_reached = passwords.len() == options.limit;
      (ids, page_limit_reached)
    }

    /** ==========================================================
     * ========================= PUBLIC =========================
     * ======================================================== */

    /// @notice Marks a password entry ID as existing
    /// @dev Internal function called when creating a password entry to prevent ID collisions
    /// @param id The unique identifier to mark as existing
    #[external("public")]
    #[internal]
    fn set_uid_exists_internal(id: Field) {
        assert(!storage.uid.at(id).read(), "id already exists");
        storage.uid.at(id).write(true);
    }

    /// @notice Marks a password entry ID as not existing
    /// @dev Internal function called when deleting a password entry to free up the ID
    /// @param id The unique identifier to mark as not existing
    #[external("public")]
    #[internal]
    fn set_uid_not_exists_internal(id: Field) {
        storage.uid.at(id).write(false);
    }

    /** ==========================================================
     * ========================= LIBRARY =========================
     * ======================================================== */

    /// @notice Internal helper to delete a password entry from a private set
    /// @dev Removes and nullifies a password entry note matching the given ID
    /// @param notes The private set to remove the password entry from
    /// @param id The unique identifier of the password entry to delete
    #[contract_library_method]
    fn _delete_password_entry_internal(
      notes: PrivateSet<PasswordEntryNote, &mut PrivateContext>,
      id: Field,
      ) {        
        let notes = notes.pop_notes(NoteGetterOptions::new()
          .select(PasswordEntryNote::properties().id, Comparator.EQ, id)
          .set_limit(1));
        assert(notes.len() == 1, "password entry not found");
    }

    /// @notice Validates that a private function call is authorized
    /// @dev Checks if the message sender matches the 'from' address, or validates an auth witness if different
    /// @param context The private context for the function call
    /// @param from The address that should be authorized to perform the action
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
