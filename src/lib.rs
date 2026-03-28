#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Vec, String};

#[contracttype]
#[derive(Clone)]
pub struct StudentProfile {
    pub name: String,
    pub email: String,
    pub id_hash: BytesN<32>, // Store SHA-256 hash of Univ ID
    pub profile_pic: String, // Store Base64 or URL
}

#[contracttype]
pub enum DataKey {
    Admin,
    Credentials(Address),
    Profile(Address), // Stores StudentProfile
    Students,
}

/// A structured record representing a single degree or certificate.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Credential {
    pub doc_hash: BytesN<32>, // Cryptographic SHA-256 hash of the off-chain JSON degree data
    pub is_valid: bool,       // Allows the university to revoke fraudulent/erroneous issues
}

#[contract]
pub struct VeracityLink;

#[contractimpl]
impl VeracityLink {
    /// Initializes the registry with the Master Registrar (Admin) address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract is already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        // Initialize an empty global student list
        let empty_list: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Students, &empty_list);
    }

    /// Exposes the admin address to the frontend for initialization checks.
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    /// Mitigates Admin SPOF by allowing the current admin to transfer powers to a new key.
    pub fn transfer_admin(env: Env, new_admin: Address) {
        let current_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        current_admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    /// Register a new student profile on-chain.
    /// University ID is expected as a 32-byte SHA-256 hash.
    pub fn register_student(env: Env, student: Address, name: String, email: String, id_hash: BytesN<32>, profile_pic: String) {
        student.require_auth();

        // 1. Store profile
        let profile = StudentProfile { name, email, id_hash, profile_pic };
        env.storage().persistent().set(&DataKey::Profile(student.clone()), &profile);

        // 2. Add to global directory if not already there
        let mut students: Vec<Address> = env.storage().instance().get(&DataKey::Students).unwrap_or(Vec::new(&env));
        let mut exists = false;
        for s in students.iter() {
            if s == student {
                exists = true;
                break;
            }
        }
        if !exists {
            students.push_back(student);
            env.storage().instance().set(&DataKey::Students, &students);
        }
    }

    /// Fetch a student's public profile (Name, Email, and Hashed ID).
    pub fn get_student_profile(env: Env, student: Address) -> Option<StudentProfile> {
        env.storage().persistent().get(&DataKey::Profile(student))
    }

    /// Admin uses this to see a list of all students who have appeared/onboarded.
    pub fn get_all_students(env: Env) -> Vec<Address> {
        env.storage().instance().get(&DataKey::Students).unwrap_or(Vec::new(&env))
    }

    /// Issues a new verifiable credential by appending its hash to the student's record.
    pub fn issue_credential(env: Env, student: Address, doc_hash: BytesN<32>) {
        let admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Registry not initialized. Admin must call initialize() first.");
            
        admin.require_auth();

        // Retrieve existing credentials or start a new empty vector
        let mut creds: Vec<Credential> = env.storage()
            .persistent()
            .get(&DataKey::Credentials(student.clone()))
            .unwrap_or(Vec::new(&env));
        
        // Prevent exact duplicate hashes from being added using an index loop
        for i in 0..creds.len() {
            let c = creds.get(i).unwrap();
            if c.doc_hash == doc_hash {
                panic!("This credential hash has already been issued to this student");
            }
        }
        
        creds.push_back(Credential { doc_hash, is_valid: true });
        env.storage().persistent().set(&DataKey::Credentials(student), &creds);
    }

    /// Revokes a credential by finding its hash and flipping `is_valid` to false.
    pub fn revoke_credential(env: Env, student: Address, doc_hash: BytesN<32>) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut creds: Vec<Credential> = env.storage()
            .persistent()
            .get(&DataKey::Credentials(student.clone()))
            .expect("No credentials found for this student");
        
        let mut updated = false;
        for i in 0..creds.len() {
            let mut c = creds.get(i).unwrap();
            if c.doc_hash == doc_hash {
                c.is_valid = false;
                creds.set(i, c); // Update the struct in the vector
                updated = true;
                break;
            }
        }
        
        if !updated {
            panic!("Credential hash not found in student records");
        }
        
        env.storage().persistent().set(&DataKey::Credentials(student), &creds);
    }

    /// Employers use this to verify if a given JSON document hash is authentic and unrevoked.
    pub fn verify_credential(env: Env, student: Address, doc_hash: BytesN<32>) -> bool {
        let creds: Vec<Credential> = env.storage()
            .persistent()
            .get(&DataKey::Credentials(student))
            .unwrap_or(Vec::new(&env));
            
        for i in 0..creds.len() {
            let c = creds.get(i).unwrap();
            if c.doc_hash == doc_hash && c.is_valid {
                return true;
            }
        }
        false
    }

    /// Students use this to fetch all their issued credentials to display in their profile.
    pub fn get_credentials(env: Env, student: Address) -> Vec<Credential> {
        env.storage()
            .persistent()
            .get(&DataKey::Credentials(student))
            .unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test;