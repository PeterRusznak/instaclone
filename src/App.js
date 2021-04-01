import React, { useEffect, useState } from 'react';
import Uploader from './Uploader.js';
import Instaclone from "./Instaclone.json"

const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })
const ethers = require('ethers');

function App() {

  const [buffer, setBuffer] = useState();
  const [contract, setContract] = useState();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true)
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();
    const contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3" //local

    let con = new ethers.Contract(contract_address, Instaclone.abi, signer)
    setContract(con)
    const imagesCount = await con.imageCount()
    // Load images
    for (var i = 1; i <= imagesCount.toNumber(); i++) {
      const image = await con.images(i)
      console.log("image from chain", image);
      images.push(image)
    }
    images.sort((a, b) => b.tipAmount - a.tipAmount);
    setLoading(false)
  }

  useEffect(() => {
    const load = async () => {
      await connect();
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

  const uploadImage = description => {
    console.log(buffer);
    console.log(description);
    //adding file to the IPFS

    ipfs.files.add(buffer, async (error, result) => {
      console.log('Ipfs result = ', result)
      if (error) {
        console.error(error)
        return
      }
      const tx = await contract.uploadImage(result[0].hash, description);
      console.log("tx = ", tx)
      const receipt = await tx.wait();
      console.log("receipt = ", receipt)
    })
  }

  const tipImageOwner = async (id, tipAmount) => {
    console.log(id, tipAmount);
    const tx = await contract.tipImageOwner(id, { value: tipAmount })
    console.log("tx = ", tx)
    const receipt = await tx.wait();
    console.log("receipt = ", receipt)
  }

  return (
    <div className="App">
      { loading
        ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
        : <Uploader
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
