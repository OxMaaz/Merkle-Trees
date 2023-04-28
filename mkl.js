const crypto = require('crypto');

class MerkleTree {
  constructor(data) {
    this.leaves = data.map(d => this.hash(d));
    this.levels = this.buildTree(this.leaves);
  }

  hash(data) {
    return crypto.createHash('sha256').update(data).digest();
  }

  buildTree(leaves) {
    let levels = [leaves];
    while (levels[0].length > 1) {
      let level = [];
      for (let i = 0; i < levels[0].length; i += 2) {
        let left = levels[0][i];
        let right = (i + 1 < levels[0].length) ? levels[0][i + 1] : Buffer.alloc(32);
        let parent = this.hash(Buffer.concat([left, right]));
        level.push(parent);
      }
      levels.unshift(level);
    }
    return levels;
  }

  getRoot() {
    return this.levels[0][0];
  }

  getProof(index) {
    let proof = [];
    for (let i = 0; i < this.levels.length - 1; i++) {
      let level = this.levels[i];
      let isRightNode = index % 2;
      let siblingIndex = (isRightNode ? index - 1 : index + 1);
      if (siblingIndex < level.length) {
        proof.push(level[siblingIndex]);
      }
      index = Math.floor(index / 2);
    }
    return proof;
  }

  static verifyRoot(root, proof, data, index) {
    let hash = data.map(d => this.hash(d));
    for (let i = 0; i < proof.length; i++) {
      let isRightNode = index % 2;
      let sibling = (isRightNode ? proof[i] : proof[i].reverse());
      hash.push(Buffer.concat([hash[index], sibling]));
      index = Math.floor(index / 2);
    }
    return Buffer.compare(root, hash[0]) === 0;
  }
}

let data = ['a', 'b', 'c', 'd'];
let tree = new MerkleTree(data);

// Get the root hash of the tree
let root = tree.getRoot();

// Get the Merkle proof for the second leaf (index 1)
let proof = tree.getProof(1);

// Verify that the second leaf is part of the tree
let isValid = MerkleTree.verifyRoot(root, proof, data, 1);
console.log(isValid); // true
