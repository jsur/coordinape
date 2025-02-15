"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAccessControl__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "minters",
                type: "address[]",
            },
        ],
        name: "AllowlistedAddressesAdded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "minters",
                type: "address[]",
            },
        ],
        name: "AllowlistedAddressesRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "minters",
                type: "address[]",
            },
        ],
        name: "MintersAdded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "minters",
                type: "address[]",
            },
        ],
        name: "MintersRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_addresses",
                type: "address[]",
            },
        ],
        name: "addAllowlistedAddresses",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_minters",
                type: "address[]",
            },
        ],
        name: "addMinters",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "allowlistDisabled",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "allowlistedAddresses",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bool",
                name: "_status",
                type: "bool",
            },
        ],
        name: "changePauseStatus",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "disableAllowlist",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "disableMintingForever",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "disablePausingForever",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "foreverUnpaused",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "minters",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "mintingDisabled",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "paused",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_addresses",
                type: "address[]",
            },
        ],
        name: "removeAllowlistedAddresses",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_minters",
                type: "address[]",
            },
        ],
        name: "removeMinters",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b610c2d8061007e6000396000f3fe608060405234801561001057600080fd5b50600436106100db5760003560e01c806306ca0bad146100e0578063103ee2f5146100ea57806321afb5ee146101225780633424b8ce146101355780635c975abb146101485780635fc1964f14610155578063715018a61461016857806371e2a6571461017057806372be7ec3146101835780637a131ebe1461018b5780638da5cb5b1461019d5780639b198950146101bd578063c4722a4d146101d1578063cf8e629a146101e4578063f2fde38b146101ec578063f356c912146101ff578063f46eccc414610212575b600080fd5b6100e8610235565b005b61010d6100f83660046109ac565b60026020526000908152604090205460ff1681565b60405190151581526020015b60405180910390f35b60035461010d9062010000900460ff1681565b6100e8610143366004610a3b565b6102db565b60035461010d9060ff1681565b6100e86101633660046109cd565b610345565b6100e861045b565b6100e861017e3660046109cd565b610496565b6100e861059f565b60035461010d90610100900460ff1681565b6101a561060d565b6040516001600160a01b039091168152602001610119565b60035461010d906301000000900460ff1681565b6100e86101df3660046109cd565b61061c565b6100e8610727565b6100e86101fa3660046109ac565b610795565b6100e861020d3660046109cd565b610835565b61010d6102203660046109ac565b60016020526000908152604090205460ff1681565b3361023e61060d565b6001600160a01b03161461026d5760405162461bcd60e51b815260040161026490610aa7565b60405180910390fd5b60035462010000900460ff16156102c85760405162461bcd60e51b815260206004820152602b6024820152600080516020610bd883398151915260448201526a696e7420616e796d6f726560a81b6064820152608401610264565b6003805462ff0000191662010000179055565b336102e461060d565b6001600160a01b03161461030a5760405162461bcd60e51b815260040161026490610aa7565b600354610100900460ff16156103325760405162461bcd60e51b815260040161026490610adc565b6003805460ff1916911515919091179055565b3361034e61060d565b6001600160a01b0316146103745760405162461bcd60e51b815260040161026490610aa7565b60035462010000900460ff161561039d5760405162461bcd60e51b815260040161026490610b27565b60005b8181101561041d576000600160008585858181106103ce57634e487b7160e01b600052603260045260246000fd5b90506020020160208101906103e391906109ac565b6001600160a01b031681526020810191909152604001600020805460ff19169115159190911790558061041581610bb0565b9150506103a0565b507fa4bd966469c62332cc5041d465060dbc3e847c7b125422e59ddb3e61a2005ae7828260405161044f929190610a5b565b60405180910390a15050565b3361046461060d565b6001600160a01b03161461048a5760405162461bcd60e51b815260040161026490610aa7565b6104946000610940565b565b3361049f61060d565b6001600160a01b0316146104c55760405162461bcd60e51b815260040161026490610aa7565b60035462010000900460ff16156104ee5760405162461bcd60e51b815260040161026490610b27565b60005b8181101561056d57600180600085858581811061051e57634e487b7160e01b600052603260045260246000fd5b905060200201602081019061053391906109ac565b6001600160a01b031681526020810191909152604001600020805460ff19169115159190911790558061056581610bb0565b9150506104f1565b507f6050e1d24499bf62f6297dc608356dc088c4e4b4fd753a8606207fdf078578e3828260405161044f929190610a5b565b336105a861060d565b6001600160a01b0316146105ce5760405162461bcd60e51b815260040161026490610aa7565b600354610100900460ff16156105f65760405162461bcd60e51b815260040161026490610adc565b6003805460ff1961ff001990911661010017169055565b6000546001600160a01b031690565b3361062561060d565b6001600160a01b03161461064b5760405162461bcd60e51b815260040161026490610aa7565b6003546301000000900460ff16156106755760405162461bcd60e51b815260040161026490610b67565b60005b818110156106f5576001600260008585858181106106a657634e487b7160e01b600052603260045260246000fd5b90506020020160208101906106bb91906109ac565b6001600160a01b031681526020810191909152604001600020805460ff1916911515919091179055806106ed81610bb0565b915050610678565b507ff875362c4f1cfd50ea9685a61df0a1c19304428e6c289bf17208b0baa8b575d9828260405161044f929190610a5b565b3361073061060d565b6001600160a01b0316146107565760405162461bcd60e51b815260040161026490610aa7565b6003546301000000900460ff16156107805760405162461bcd60e51b815260040161026490610b67565b6003805463ff00000019166301000000179055565b3361079e61060d565b6001600160a01b0316146107c45760405162461bcd60e51b815260040161026490610aa7565b6001600160a01b0381166108295760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610264565b61083281610940565b50565b3361083e61060d565b6001600160a01b0316146108645760405162461bcd60e51b815260040161026490610aa7565b6003546301000000900460ff161561088e5760405162461bcd60e51b815260040161026490610b67565b60005b8181101561090e576000600260008585858181106108bf57634e487b7160e01b600052603260045260246000fd5b90506020020160208101906108d491906109ac565b6001600160a01b031681526020810191909152604001600020805460ff19169115159190911790558061090681610bb0565b915050610891565b507f8e57ccca240b595c47024ae5107fe735c445b00720b01a618479f91709ee9803828260405161044f929190610a5b565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b80356001600160a01b03811681146109a757600080fd5b919050565b6000602082840312156109bd578081fd5b6109c682610990565b9392505050565b600080602083850312156109df578081fd5b82356001600160401b03808211156109f5578283fd5b818501915085601f830112610a08578283fd5b813581811115610a16578384fd5b8660208083028501011115610a29578384fd5b60209290920196919550909350505050565b600060208284031215610a4c578081fd5b813580151581146109c6578182fd5b60208082528181018390526000908460408401835b86811015610a9c576001600160a01b03610a8984610990565b1682529183019190830190600101610a70565b509695505050505050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b6020808252602b908201527f416363657373436f6e74726f6c3a20436f6e747261637420697320756e70617560408201526a39b2b2103337b932bb32b960a91b606082015260800190565b6020808252603290820152600080516020610bd8833981519152604082015271696e7420746f6b656e7320616e796d6f726560701b606082015260800190565b60208082526029908201527f416363657373436f6e74726f6c3a20416c6c6f776c69737420616c726561647960408201526808191a5cd8589b195960ba1b606082015260800190565b6000600019821415610bd057634e487b7160e01b81526011600452602481fd5b506001019056fe416363657373436f6e74726f6c3a20436f6e74726163742063616e6e6f74206da26469706673582212209ce49756218706d8312e010f10f22659469b365fde4d24405148b61465c34db664736f6c63430008020033";
class TokenAccessControl__factory extends ethers_1.ContractFactory {
    constructor(signer) {
        super(_abi, _bytecode, signer);
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.TokenAccessControl__factory = TokenAccessControl__factory;
TokenAccessControl__factory.bytecode = _bytecode;
TokenAccessControl__factory.abi = _abi;
