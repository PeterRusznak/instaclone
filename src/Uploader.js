import React from 'react';
import Identicon from 'identicon.js';
const ethers = require('ethers');
const Uploader = ({ images, uploadImage, captureFile, tipImageOwner }) => {
    let imageDescription = "";
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <div className="content mr-auto ml-auto">

                    <h2>Share Image</h2>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const description = imageDescription.value
                        uploadImage(description, captureFile)
                    }} >
                        <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={captureFile} />
                        <div className="form-group mr-sm-2">
                            <br></br>
                            <input
                                id="imageDescription"
                                type="text"
                                ref={(input) => { imageDescription = input }}
                                className="form-control"
                                placeholder="Image description..."
                                required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">Upload!</button>
                    </form>


                    <p>&nbsp;</p>
                    {images.map((image, key) => {
                        return (
                            <div className="card mb-4" key={key} >

                                <div className="card-header">
                                    <img
                                        className='mr-2'
                                        width='30'
                                        height='30'
                                        src={`data:image/png;base64,${new Identicon(image.author, 30).toString()}`}
                                    />

                                    <small className="text-muted">{image.author}</small>
                                </div>



                                <ul id="imageList" className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${image.hash}`} style={{ maxWidth: '420px' }} /></p>
                                        <p>{image.description}</p>
                                    </li>

                                    <li key={key} className="list-group-item py-2">
                                        <small className="float-left mt-1 text-muted">
                                            TIPS: {ethers.utils.formatEther(image.tipAmount)} ETH
                                        </small>
                                        <button
                                            className="btn btn-link btn-sm float-right pt-0"
                                            name={image.id}
                                            onClick={(event) => {
                                                let tipAmount = ethers.utils.parseEther('0.01')
                                                tipImageOwner(event.target.name, tipAmount)
                                            }}
                                        >
                                            TIP 0.1 ETH
                                        </button>
                                    </li>
                                </ul>



                            </div>
                        )
                    })}

                </div>
            </div>
        </div >
    )
}

export default Uploader
