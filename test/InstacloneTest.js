
const { expect } = require("chai");


describe('Instaclone contract', () => {
    let InstacloneContract
    let instaclone
    let owner
    let author
    let tipper


    before(async () => {
        InstacloneContract = await ethers.getContractFactory("Instaclone");
        [owner, author, tipper, ...addrs] = await ethers.getSigners();
        instaclone = await InstacloneContract.deploy();
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await instaclone.address
            expect(address).not.to.equal(0x0);
            expect(address).not.to.equal('');
            expect(address).not.to.equal(null);
            expect(address).not.to.equal(undefined);
        })

        it('has a name', async () => {
            const name = await instaclone.name()
            expect(name).to.equal("Instaclone");
        })
    })

    describe('images', async () => {
        let result, imageCount, ev, args
        const hash = 'QmZGQA92ri1jfzSu61JRaNQXYg1bLuM7p8YT83DzFA2KLH'

        before(async () => {
            result = await instaclone.connect(author).uploadImage(hash, 'Image description')
            ev = await result.wait()
            args = ev.events[0].args
            imageCount = await instaclone.imageCount()
        })


        //check event
        it('creates images', async () => {
            // SUCESS
            expect(imageCount.toNumber()).to.equal(1);
            expect(args.id.toNumber()).to.equal(imageCount.toNumber(), "id is correct");

            expect(args.hash).to.equal(hash, "hash OK");
            expect(args.description).to.equal('Image description', "Description OK");
            expect(args.author).to.equal(author.address, 'author is correct')


            // FAILURE: Image must have hash         
            await expect(
                instaclone.connect(author).uploadImage('', 'Image description')
            ).to.be.revertedWith("Must have HASH");

            // FAILURE: Image must have description
            await expect(
                instaclone.connect(author).uploadImage(hash, "")
            ).to.be.revertedWith("Must have DESCRIPTION");
        })

        //check from Struct
        it('lists images', async () => {
            const image = await instaclone.images(imageCount)
            expect(image.id.toNumber()).to.equal(imageCount.toNumber(), "id OK");
            expect(image.hash).to.equal(hash, 'Hash is correct')
            expect(image.tipAmount).to.equal(0, 'Amount is correct')
            expect(image.description).to.equal('Image description', 'description is correct')
            expect(image.author).to.equal(author.address, 'author is correct')
        })


        it('allows users to tip images', async () => {
            // Track the author balance before purchase

            let oldAuthorBalance = await ethers.provider.getBalance(author.address);
            let oldAuthorBalanceString = ethers.utils.formatEther(oldAuthorBalance)

            let weiValue = ethers.utils.parseEther('1')
            result = await instaclone.connect(tipper).tipImageOwner(imageCount, { value: weiValue });

            ev = await result.wait()
            args = ev.events[0].args
            imageCount = await instaclone.imageCount()

            expect(args.id.toNumber()).to.equal(imageCount.toNumber(), "id NEM OK");
            expect(args.hash).to.equal(hash, 'Hash is correct')
            expect(args.description).to.equal('Image description', 'Hash is correct')
            expect(args.tipAmount).to.equal(weiValue, 'Tip amount is correct')
            expect(args.author).to.equal(author.address, 'Tip amount is correct')

            // Check that author received funds
            let newAuthorBalance = await ethers.provider.getBalance(author.address);
            let newAuthorBalanceString = ethers.utils.formatEther(newAuthorBalance)
            console.log(newAuthorBalanceString)

            let tip = ethers.utils.parseEther('1')
            const expectedBalance = oldAuthorBalance.add(tip)
            expect(newAuthorBalanceString).to.equal(ethers.utils.formatEther(expectedBalance), "Author account INCREASED")

            // FAILURE: Tries to tip a image that does not exist

            await expect(
                instaclone.connect(tipper).tipImageOwner(9999, { value: weiValue })
            ).to.be.revertedWith("NOT EXISTING IMAGE");

        })
    })
})


