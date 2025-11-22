use aztec::{
    macros::notes::note,
    protocol_types::{address::AztecAddress, traits::{Deserialize, Packable, Serialize}},
};
use compressed_string::FieldCompressedString;

#[derive(Deserialize, Eq, Packable, Serialize)]
#[note]
pub struct PasswordEntryNote {
    password: FieldCompressedString,
    owner: AztecAddress,
    randomness: Field,
}

impl PasswordEntryNote {
    pub fn new(password: FieldCompressedString, owner: AztecAddress, randomness: Field) -> Self {
        Self { password, owner, randomness }
    }

    pub fn get_password(self) -> FieldCompressedString {
        self.password
    }
}