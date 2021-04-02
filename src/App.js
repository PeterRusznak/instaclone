import React, { useEffect, useState } from 'react';
import Renderer from './Renderer.js';
import Instaclone from "./Instaclone.json"

const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })
const ethers = require('ethers');

function App() {

  const [contract, setContract] = useState();
  const [buffer, setBuffer] = useState();
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false);

  const connectBlockChain = async () => {
    setLoading(true)
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();
    const contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3" //local
    let deployedContract = new ethers.Contract(contract_address, Instaclone.abi, signer)
    setContract(deployedContract);

    await fetchImgages(deployedContract);
    setLoading(false)
  }

  // Load images
  const fetchImgages = async (contract) => {
    const imagesCount = await contract.imageCount()
    for (var i = 1; i <= imagesCount.toNumber(); i++) {
      const image = await contract.images(i);
      images.push(image);
    }
    images.sort((a, b) => b.tipAmount - a.tipAmount);
  }

  useEffect(() => {
    const load = async () => {
      await connectBlockChain();
    }
    load();
  }, []);

  const captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      let buff = Buffer(reader.result)
      setBuffer(buff);
    }
  }

  const uploadImage = async (description) => {
    //adding file to the IPFS
    ipfs.files.add(buffer, async (error, result) => {
      console.log('Ipfs result = ', result)
      if (error) {
        console.error(error)
        return
      }
      //uploading hash to blockchain
      const tx = await contract.uploadImage(result[0].hash, description);
      console.log("tx = ", tx)
      const receipt = await tx.wait();
      console.log("receipt = ", receipt)
    })
  }

  const tipImageOwner = async (id, tipAmount) => {
    const tx = await contract.tipImageOwner(id, { value: tipAmount })
    console.log("tx = ", tx)
    const receipt = await tx.wait();
    console.log("receipt = ", receipt)
  }

  return (
    <div className="App">
      { loading
        ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
        : <Renderer
          images={images}
          captureFile={captureFile}
          uploadImage={uploadImage}
          tipImageOwner={tipImageOwner}
        />
      }
    </div>
  );
}
export default App;

