use aztec::{
    protocol_types::{
      address::AztecAddress,
      storage::map::derive_storage_slot_in_map,
    },
    test::helpers::test_environment::TestEnvironment,
};
use compressed_string::FieldCompressedString;

pub unconstrained fn setup_contract(
    with_account_contracts: bool,
) -> (&mut TestEnvironment, AztecAddress, AztecAddress, AztecAddress, AztecAddress) {
    // Setup env, generate keys
    let mut env = TestEnvironment::new();
    let (owner, recipient, attacker) = if with_account_contracts {
        let owner = env.create_contract_account();
        let recipient = env.create_contract_account();
        let attacker = env.create_contract_account();
        (owner, recipient, attacker)
    } else {
        let owner = env.create_light_account();
        let recipient = env.create_light_account();
        let attacker = env.create_light_account();
        (owner, recipient, attacker)
    };

    let contract_address = deploy_contract(&mut env, owner);

    (&mut env, contract_address, owner, recipient, attacker)
}

pub unconstrained fn deploy_contract(
    env: &mut TestEnvironment,
    _owner: AztecAddress,
) -> AztecAddress {
    let contract_address = env.deploy("@password_manager/PasswordManager").without_initializer();
    contract_address
}


pub unconstrained fn create_compressed_string(s: str<31>) -> FieldCompressedString {
    FieldCompressedString::from_string(s)
}
