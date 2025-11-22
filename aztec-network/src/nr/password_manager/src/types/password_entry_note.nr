use aztec::{
    macros::notes::note,
    protocol_types::{address::AztecAddress, traits::{Deserialize, Packable, Serialize}},
    oracle::random::random,
};
use compressed_string::FieldCompressedString;

#[derive(Deserialize, Eq, Packable, Serialize)]
#[note]
pub struct PasswordEntryNote {
    label: FieldCompressedString,
    password: FieldCompressedString,
    owner: AztecAddress,
    recipient: AztecAddress,
    id: Field,
    randomness: Field,
}

impl PasswordEntryNote {
    pub fn new(label: FieldCompressedString, password: FieldCompressedString, owner: AztecAddress, id: Field, randomness: Field) -> Self {
        Self { label, password, owner, recipient: AztecAddress::zero(), id, randomness }
    }

    pub fn share(self, recipient: AztecAddress) -> Self {
        // Safety: trusted relationship assumed between owner and recipient
        let randomness = unsafe { random() };
        Self { label: self.label, password: self.password, owner: self.owner, recipient, id: self.id, randomness }
    }

    pub fn get_label(self) -> FieldCompressedString {
        self.label
    }

    pub fn get_password(self) -> FieldCompressedString {
        self.password
    }

    pub fn get_owner(self) -> AztecAddress {
        self.owner
    }

    pub fn get_id(self) -> Field {
        self.id
    }
}