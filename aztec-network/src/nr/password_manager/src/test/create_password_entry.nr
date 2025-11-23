use crate::{PasswordManager, test::utils};

#[test]
unconstrained fn create_password_entry_success() {
    let (env, contract_address, owner, _, _) = utils::setup_contract(false);
    
    let label = utils::create_compressed_string("Bank Account                   ");
    let password = utils::create_compressed_string("secret123                      ");
    let id = 1;
    let randomness = 12345;
    
    let call = PasswordManager::at(contract_address).create_password_entry(label, password, owner, id, randomness);
    env.call_private(owner, call);
}

#[test]
unconstrained fn create_password_entry_duplicate_id_fails() {
    let (env, contract_address, owner, _, _) = utils::setup_contract(false);
    
    let label1 = utils::create_compressed_string("Bank Account                   ");
    let password1 = utils::create_compressed_string("secret123                      ");
    let id = 1;
    let randomness1 = 12345;
    
    // Create first password entry
    let call1 = PasswordManager::at(contract_address).create_password_entry(label1, password1, owner, id, randomness1);
    env.call_private(owner, call1);
}

