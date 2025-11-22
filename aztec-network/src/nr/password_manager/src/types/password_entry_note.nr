use aztec::{
    macros::notes::note,
    protocol_types::{address::AztecAddress, traits::{Deserialize, Packable, Serialize}},
};
use compressed_string::FieldCompressedString;

#[derive(Deserialize, Eq, Packable, Serialize)]
#[note]
pub struct PasswordEntryNote {
    label: FieldCompressedString,
    password: FieldCompressedString,
    owner: AztecAddress,
    id: Field,
    randomness: Field,
}

impl PasswordEntryNote {
    pub fn new(label: FieldCompressedString, password: FieldCompressedString, owner: AztecAddress, id: Field, randomness: Field) -> Self {
        Self { label, password, owner, id, randomness }
    }

    pub fn get_label(self) -> FieldCompressedString {
        self.label
    }

    pub fn get_password(self) -> FieldCompressedString {
        self.password
    }

    pub fn get_id(self) -> Field {
        self.id
    }
}