use aztec::{
    macros::notes::note,
    protocol_types::{address::AztecAddress, traits::{Deserialize, Packable, Serialize}},
};
use compressed_string::FieldCompressedString;

#[derive(Deserialize, Eq, Packable, Serialize)]
#[note]
pub struct PasswordEntryNote {
    entry_name: FieldCompressedString,
    owner: AztecAddress,
    id: Field,
    randomness: Field,
}

impl PasswordEntryNote {
    pub fn new(entry_name: FieldCompressedString, owner: AztecAddress, id: Field, randomness: Field) -> Self {
        Self { entry_name, owner, id, randomness }
    }

    pub fn get_entry_name(self) -> FieldCompressedString {
        self.entry_name
    }
}