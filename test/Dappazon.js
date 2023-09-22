const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Global constants for listing an item...
  const ID = 1
  const NAME = "Shoes"
  const CATEGORY = "Clothing"
  const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
  const COST = tokens(1)
  const RATING = 4
  const STOCK = 5


// STEP -1 ---------------------------
describe("Dappazon", () => {
  let dappazon
  let deployer, buyer

// STEP -3 ---------------------------
    beforeEach(async () => {
      // Setup accounts
      [deployer, buyer] = await ethers.getSigners() // we don't need to run hardhat node(local blockchain) to execute this specific code.

      // Deploy contract
      const Dappazon = await ethers.getContractFactory("Dappazon")
      dappazon = await Dappazon.deploy()
    })

// STEP -4 ---------------------------
    describe("Deployment", () => {
      it("Sets the owner", async () => {
        expect(await dappazon.owner()).to.equal(deployer.address) // 1st address of ethers.getSigners() is deployer of contract by default
      })
    })

    describe("Listing", () => {
      let transaction
  
      beforeEach(async () => {
        // List a item
        transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
        await transaction.wait()

        console.log('Before dappzon balance', await ethers.provider.getBalance(dappazon.address))
        console.log('Before owner balance', await ethers.provider.getBalance(deployer.address))
        console.log('Before buyer balance', await ethers.provider.getBalance(buyer.address))
      })
  
      it("Returns item attributes", async () => {
        const item = await dappazon.items(ID)
  
        expect(item.id).to.equal(ID)
        expect(item.name).to.equal(NAME)
        expect(item.category).to.equal(CATEGORY)
        expect(item.image).to.equal(IMAGE)
        expect(item.cost).to.equal(COST)
        expect(item.rating).to.equal(RATING)
        expect(item.stock).to.equal(STOCK)
      })
  
      it("Emits List event", () => {
        expect(transaction).to.emit(dappazon, "List")
      })
    })
  
    describe("Buying", () => {
      let transaction
  
      beforeEach(async () => {
        // List a item
        transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
        await transaction.wait()
  
        // Buy a item
        transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
        await transaction.wait()



      })
  
  
      it("Updates buyer's order count", async () => {
        const result = await dappazon.orderCount(buyer.address)
        expect(result).to.equal(1)

        
        console.log('After dappzon balance', await ethers.provider.getBalance(dappazon.address))
        console.log('After owner balance', await ethers.provider.getBalance(deployer.address))
        console.log('After buyer balance', await ethers.provider.getBalance(buyer.address))
      })
  
      it("Adds the order", async () => {
        const order = await dappazon.orders(buyer.address, 1)
  
        expect(order.time).to.be.greaterThan(0)
        expect(order.item.name).to.equal(NAME)
      })
  
      it("Updates the contract balance", async () => {
        const result = await ethers.provider.getBalance(dappazon.address)
        expect(result).to.equal(0)
      })

      // it("Updates the owner balance", async () => {
      //   const result = await ethers.provider.getBalance(deployer.address)
      //   expect(result).to.equal(0)
      // })

      // it("Sends Money to owner", async()=>{
      //   const result = await ethers.provider.getBalance(dappazon.address)

      // })
  
      it("Emits Buy event", () => {
        expect(transaction).to.emit(dappazon, "Buy")
      })
    })
  
    describe("Withdrawing", () => {
      let balanceBefore
  
      beforeEach(async () => {
        // List a item
        let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
        await transaction.wait()
  
        // Buy a item
        transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
        await transaction.wait()
  
        // Get Deployer balance before
        balanceBefore = await ethers.provider.getBalance(deployer.address)
  
        // Withdraw
        transaction = await dappazon.connect(deployer).withdraw()
        await transaction.wait()
      })
  
      // it('Updates the owner balance', async () => {
      //   const balanceAfter = await ethers.provider.getBalance(deployer.address)
      //   expect(balanceAfter).to.equal(balanceBefore)
      // })
  
      it('Updates the contract balance', async () => {
        const result = await ethers.provider.getBalance(dappazon.address)
        expect(result).to.equal(0)
      })
    })
})
