use crate::PasswordManager;
use aztec::{
    protocol_types::address::AztecAddress,
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

/// @dev Check if owner has a password entry with the given ID
pub unconstrained fn owns_password_entry(
    env: TestEnvironment,
    contract_address: AztecAddress,
    owner: AztecAddress,
    id: Field,
) -> bool {
    let (ids, _) = env.simulate_utility(PasswordManager::at(contract_address).get_password_entry_ids(owner, 0));

    let mut entry_found = false;
    for obtained_id in ids {
        if obtained_id == id {
            entry_found = true;
        }
    }
    entry_found
}

/// @dev Assert that owner has a password entry with the given ID
pub unconstrained fn assert_owns_password_entry(
    env: TestEnvironment,
    contract_address: AztecAddress,
    owner: AztecAddress,
    id: Field,
) {
    let entry_found = owns_password_entry(env, contract_address, owner, id);
    assert(entry_found, "Password entry not found in owner's entries");
}

/// @dev Retrieve password entry note details (label and password) by ID
pub unconstrained fn get_password_entry_details(
    env: TestEnvironment,
    contract_address: AztecAddress,
    owner: AztecAddress,
    id: Field,
    page_index: u32,
) -> (FieldCompressedString, FieldCompressedString) {
    let (label, password) = env.simulate_utility(
        PasswordManager::at(contract_address).get_password_entry_by_id(owner, id, page_index)
    );
    (label, password)
}
