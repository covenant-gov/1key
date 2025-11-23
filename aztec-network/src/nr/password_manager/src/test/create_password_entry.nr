use crate::{PasswordManager, test::utils};
use compressed_string::FieldCompressedString;

#[test]
unconstrained fn create_password_entry_success() {
    let (env, contract_address, owner, _, _) = utils::setup_contract(false);
    
    let label = utils::create_compressed_string("Bank Account                   ");
    let password = utils::create_compressed_string("secret123                      ");
    let id = 1;
    let randomness = 12345;
    
    // Create password entry
    let call = PasswordManager::at(contract_address).create_password_entry(label, password, owner, id, randomness);
    env.call_private(owner, call);
    
    // Verify the entry exists (dereference &mut TestEnvironment to TestEnvironment)
    utils::assert_owns_password_entry(*env, contract_address, owner, id);
    
    // Verify we can retrieve the entry details and they match
    let (retrieved_label, retrieved_password) = utils::get_password_entry_details(*env, contract_address, owner, id, 0);
    assert(label == retrieved_label, "Label mismatch");
    assert(password == retrieved_password, "Password mismatch");
}

#[test]
unconstrained fn create_password_entry_attacker_cannot_view() {
    let (env, contract_address, owner, _, attacker) = utils::setup_contract(false);
    
    let label = utils::create_compressed_string("Bank Account                   ");
    let password = utils::create_compressed_string("secret123                      ");
    let id = 1;
    let randomness = 12345;
    
    // Owner creates password entry
    let call = PasswordManager::at(contract_address).create_password_entry(label, password, owner, id, randomness);
    env.call_private(owner, call);
    
    // Verify owner can see it
    utils::assert_owns_password_entry(*env, contract_address, owner, id);
    
    // Verify attacker cannot see the entry in their list
    let attacker_owns = utils::owns_password_entry(*env, contract_address, attacker, id);
    assert(!attacker_owns, "Attacker should not be able to see owner's password entry");
    
    // Verify attacker cannot retrieve the entry details (should return empty/default values)
    let (attacker_label, attacker_password) = utils::get_password_entry_details(*env, contract_address, attacker, id, 0);
    let empty_string = FieldCompressedString::from_string("                               ");
    assert(attacker_label == empty_string, "Attacker should not be able to retrieve label");
    assert(attacker_password == empty_string, "Attacker should not be able to retrieve password");
}

#[test]
unconstrained fn create_password_entry_duplicate_id_success() {
    let (env, contract_address, owner, _, _) = utils::setup_contract(false);
    
    let label1 = utils::create_compressed_string("Bank Account                   ");
    let password1 = utils::create_compressed_string("secret123                      ");
    let id = 1;
    let randomness1 = 12345;
    
    // Create first password entry
    let call1 = PasswordManager::at(contract_address).create_password_entry(label1, password1, owner, id, randomness1);
    env.call_private(owner, call1);
}

#[test(should_fail_with = "id already exists")]
unconstrained fn create_password_entry_duplicate_id_fails() {
    let (env, contract_address, owner, _, _) = utils::setup_contract(false);
    
    let label1 = utils::create_compressed_string("Bank Account                   ");
    let password1 = utils::create_compressed_string("secret123                      ");
    let id = 1;
    let randomness1 = 12345;
    let randomness2 = 67890;
    
    // Create first password entry
    let call1 = PasswordManager::at(contract_address).create_password_entry(label1, password1, owner, id, randomness1);
    env.call_private(owner, call1);
    
    // Attempt to create a duplicate entry with the same ID - this should fail
    let label2 = utils::create_compressed_string("Email Account                  ");
    let password2 = utils::create_compressed_string("password456                    ");
    let call2 = PasswordManager::at(contract_address).create_password_entry(label2, password2, owner, id, randomness2);
    env.call_private(owner, call2);
}

