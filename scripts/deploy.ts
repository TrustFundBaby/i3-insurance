import { ethers } from "hardhat";

const formatAddress = (a = "") =>
  `${a.substr(0, 6)}...${a.substr(a.length - 4, 4)}`;

  const dollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

const sleep = async (ms: number) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, ms);
})

async function main() {
  const accounts = await ethers.getSigners();

  // Deploy USDC
  const USDCToken = await ethers.getContractFactory("USDCToken");
  const usdc = await USDCToken.deploy(ethers.utils.parseUnits("1000000000", 18));
  await usdc.deployed();
  await usdc.transfer(accounts[1].address, ethers.utils.parseUnits("50000", 18))

  console.log('*************************************')
  console.log('USDC Token: ', usdc.address);
  console.log(`Transferring 50K USDC to ${formatAddress(accounts[1].address)}`)
  console.log(`Balance (${formatAddress(accounts[1].address)}): `, ((await usdc.balanceOf(accounts[1].address)).toString()))
  console.log('*************************************\n\n')

  await sleep(1000); // $DEMO:

  // Deploy IssuedPoliciesRegistry
  const IssuedPoliciesRegistry  = await ethers.getContractFactory("IssuedPoliciesRegistry");
  const registry = await IssuedPoliciesRegistry.deploy();
  await registry.deployed();

  console.log('*************************************')
  console.log('Issued Policies Registry');
  console.log('\nDeployed at: ', registry.address)
  console.log('*************************************\n\n')


  // Deploy Policy #1
  const P1 = await ethers.getContractFactory("P1");
  const p1 = await P1.deploy(
    ethers.utils.parseUnits("0.4", 18),
    ethers.utils.parseUnits("240", 18),
    ethers.utils.parseUnits("0.25", 18),
    ethers.utils.parseUnits("0.10", 18)
  );
  await p1.deployed();

  console.log('*************************************')
  console.log('Policy #1');
  console.log('** Loss Exposure: 40%');
  console.log('** Avg. per unit lost: $600');
  console.log('** Expense Ratio: 25%');
  console.log('** Profit Ratio: 10%');
  console.log('** Gross Premium: L / [1 - (E + P)]')
  console.log('** = $240 / [1 - (.25 + .10)]')
  console.log('** => $369 for up to $2500/coverage')
  console.log('\nDeployed at: ', p1.address)
  console.log('*************************************\n\n')

  await sleep(7000); // $DEMO:

  let r = await p1.calculatePremium();
  // let r = await p1.frequency();

  // CaptiveInsurancePool
  const CaptiveInsurancePool = await ethers.getContractFactory("CaptiveInsurancePool");
  const cip = await CaptiveInsurancePool.deploy(usdc.address, "Captive Insurer Token", "CI");
  await cip.deployed()

  console.log('*************************************')
  console.log('** Captive Insurance Pool');
  
  // Transfer 40K USDC to Captive Insurance Pool from accoun[1]
  await usdc.connect(accounts[1]).approve(cip.address, ethers.utils.parseUnits("40000", 18))
  await cip.connect(accounts[1]).deposit(accounts[1].address, ethers.utils.parseUnits("40000", 18))
  
  console.log(`** Total Capitalization: `, (await cip.totalHoldings()).toString())
  console.log(`**  Pool ownership (${formatAddress(accounts[1].address)}): `, (await cip.balanceOfUnderlying(accounts[1].address)).toString())
  console.log('\nDeployed at: ', cip.address)
  console.log('*************************************\n\n')

  await sleep(3000)
  
  // Risk Pool
  const RiskPool = await ethers.getContractFactory("RiskPool");
  const rp = await RiskPool.deploy(registry.address, cip.address, usdc.address, [p1.address]);
  await rp.deployed()

  const policies = await rp.getPolicies();
  
  console.log('*************************************')
  console.log('** Risk Pool');
  console.log('** Policies Sold by Pool:', policies);
  console.log(`** Policy Quote (${formatAddress((await policies[0]))}): `, true)
  console.log(`**** Amount`, dollars.format((await rp.quote(policies[0])).toNumber()))

  console.log('\nDeployed at: ', rp.address)
  console.log('*************************************\n\n')

  // Time to buy insurance
  console.log('*************************************')
  console.log('** Buy Coverage!!!');
  console.log('** Policy: ', policies[0]);
  
  await usdc.approve(rp.address, 369);
  const result = await (await rp.purchase(policies[0])).wait();
  console.log('Coverage purchased: ', true)

  console.log('** Total Coverage Policies: ', (await registry.balanceOf(accounts[0].address, 1)), '**')

  console.log('*************************************\n\n')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
