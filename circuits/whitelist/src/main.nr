use std::hash::pedersen_hash;

global DEPTH: u32 = 4;

fn main(
    nullifier: Field,
    secret: Field,
    merkle_path: [Field; DEPTH],
    path_indices: [u1; DEPTH],
    root: pub Field,
    nullifier_hash: pub Field,
    recipient: pub Field
    ) {
    
    let leaf = pedersen_hash([nullifier, secret]);
    let mut current = leaf;

    for i in 0..DEPTH{
        if path_indices[i] ==0 {
            current = pedersen_hash([current, merkle_path[i]]);
        } else{
            current = pedersen_hash([merkle_path[i], current]);
        }
    }

    assert(root == current);

    let computed_nullifier_hash = pedersen_hash([nullifier,recipient]);
    assert(nullifier_hash == computed_nullifier_hash);
}


#[test]
fn print_test_values() {
    let nullifier_hash = pedersen_hash([1, 999]);
    println(nullifier_hash);
}