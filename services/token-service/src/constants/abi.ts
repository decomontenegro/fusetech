// Smart contract ABI mínimo para token ERC-20
export const erc20Abi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function mint(address to, uint256 value) returns (bool)',
  'function burn(address from, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]; 