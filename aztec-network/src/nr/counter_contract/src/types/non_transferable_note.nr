use aztec::{
    protocol_types::address::AztecAddress,
    note::note_header::NoteHeader,
};
use field_compressed_string::FieldCompressedString;

/// @dev Encrypted note for password entries
/// @param owner The owner of the password entry
/// @param entry_id Unique identifier for the password entry
/// @param encrypted_data Encrypted password data (username, password, etc.)
#[aztec(note)]
pub struct PasswordEntryNote {
    owner: AztecAddress,
    entry_id: Field,
    encrypted_data: FieldCompressedString,
}

impl PasswordEntryNote {
    /// @dev Computes the note hash for nullification
    pub fn compute_note_hash(self) -> Field {
        use dep::aztec::hash::poseidon2_hash;
        poseidon2_hash([
            self.owner.to_field(),
            self.entry_id,
            self.encrypted_data.to_field(),
        ])
    }

    /// @dev Computes the nullifier for this note
    pub fn compute_nullifier(self, note_header: NoteHeader) -> Field {
        use dep::aztec::hash::poseidon2_hash;
        poseidon2_hash([self.compute_note_hash(), note_header.nullifier_secret_key])
    }
}

