import { createHash } from 'crypto'

let targetBits = BigInt(24n);
type Block = {
    timeStamp : number;
    data: string;
    prevBlockHash: string;
    hash: string;
    nonce?:number
}

type BlockChain = {
    block : Block[]
}

type ProofOfWork = {
    block : Block,
    target: BigInt
}

type ProofOfWorkOutput = {
    nonce: number,
    hash : string
}

const createProofOfWork = (block : Block):ProofOfWork => {
    const target = BigInt(1n << (256n - targetBits))
    const pow:ProofOfWork = {block, target}
    return pow
}

const prepareData = (pow: ProofOfWork, nonce: number):string => {
    const data = `${pow.block.prevBlockHash}${pow.block.data}${pow.block.timeStamp.toString(
        16
      )}${targetBits.toString(16)}${nonce.toString(16)}`;
      return data
}

const run = (pow : ProofOfWork): ProofOfWorkOutput => {
    let hashInt: BigInt
    let hash: string = "";
    let nonce = 0

    console.log(`Mining the block containing "${pow.block.data}"`);

    while(nonce < Number.MAX_SAFE_INTEGER){
        const data = prepareData(pow, nonce)
        hash = createHash('sha-256').update(data).digest('hex')
        hashInt = BigInt(`0x${hash}`)

        if(hashInt < pow.target){
            console.log(`\r${hash}`);
            break;
        }
        else{
            nonce++
        }
    }
    console.log('\n');

    return {nonce , hash}
}

const validate = (pow: ProofOfWork) => {
    let hashInt : BigInt

    const data = prepareData(pow, pow.block.nonce!)
    const hash = createHash('sha-256').update(data).digest('hex')
    hashInt = BigInt(`0x${hash}`)

    return pow.target > hashInt

}


// const setHash = (block: Block) => {
//     const timeStamp = block.timeStamp.toString()
//     const headers = `${block.prevBlockHash}${block.data}${timeStamp}`;
//     return createHash('sha256').update(headers).digest('hex')
// }

const createBlock = (data : string, prevBlockHash: string): Block => {
    const block: Block = {
        timeStamp: Date.now(),
        data,
        prevBlockHash,
        hash: "",
        
    }
    const pow = createProofOfWork(block)
    const {nonce ,hash} = run(pow)
    block.hash = hash
    block.nonce = nonce
    return block
}

const addBlock = (blockChain: BlockChain, data: string) => {
    const prevBlock = blockChain.block.at(-1)
    const newBlock = createBlock(data, prevBlock!.hash)
    blockChain.block.push(newBlock)

}

const createGenesisBlock = (): Block => {
    return createBlock('Genesis Block', "")
}

const createBlockChain = ():BlockChain => {
    return {
        block: [createGenesisBlock()]
    }
}

const main = () => {
    const blockChain = createBlockChain()

    addBlock(blockChain, 'Send 1 BTC to Kim')
    addBlock(blockChain, 'Send 2 more BTC to Kim')

    for (let index = 0; index < blockChain.block.length; index++) {
        const block = blockChain.block[index];
        console.log(`Prev. hash: ${block.prevBlockHash}`);
        console.log(`Data: ${block.data}`);
        console.log(`Hash: ${block.hash}`);

        const pow = createProofOfWork(block)
        console.log(`PoW: ${validate(pow)}\n`);
      }
}

main()