import { utils } from "ethers"
import { Select } from "antd"
import React, { useState, useCallback, useEffect } from "react"
import { Address, AddressInput } from "../components"
import { useTokenList } from "eth-hooks/dapps/dex"
import "../CSS/general.css"
import { useDropzone } from "react-dropzone"
import Axios from 'axios';

const { Option } = Select

export function Mint ({ ipfs, tx, writeContracts, address }) {
  const [selectedToken, setSelectedToken] = useState("Pick a token!")
  const [count, setCount] = useState(0)
  const [files, setFiles] = useState(null)
  const [trait, setTrait] = useState(null)
  const [traitValue, setTraitValue] = useState(null)
  const [imagesrc, setimagesrc] = useState(null)
  const [name, setName] = useState(null)
  const [description, setDescription] = useState(null)
  const [modeSwitch, setModeSwitch] = useState(0);
  const [jsonNFT, setJsonNFT] = useState(null);

  const listOfTokens = useTokenList(
    "https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json",
  )
  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  useEffect(() => {
    console.log(files)
  }, [files])

  let json = {}
  const mintItem = async () => {
    json.attributes = {
      trait_type: trait,
      value: traitValue,
    }
    if(modeSwitch === 0){ // Mint NFT
      let image = await ipfs.add({
        path: "image.png",
        content: files[0],
      })
      json.image = "https://ipfs.io/ipfs/" + image.cid.string
      json.name = name
      json.description = description
      setJsonNFT(json)
      const uploaded = await ipfs.add(JSON.stringify(json))

      console.log("Img:", image)
      console.log("Uploaded Hash: ", uploaded)

      setimagesrc("https://ipfs.io/ipfs/" + image.cid.string)
      const result = tx(
        writeContracts && writeContracts.YourCollectible && writeContracts.YourCollectible.mintItem(uploaded.path),
        update => {
          console.log("📡 Transaction Update:", update)
          if (update && (update.status === "confirmed" || update.status === 1)) {
            console.log(" 🍾 Transaction " + update.hash + " finished!")
            console.log(
              " ⛽️ " +
                update.gasUsed +
                "/" +
                (update.gasLimit || update.gas) +
                " @ " +
                parseFloat(update.gasPrice) / 1000000000 +
                " gwei",
            )
          }
        },
      )
    } else { // Save NFT's JSON in DB
        try {
          const response = await Axios.post("https://nfter.herokuapp.com/postAd",{
              "json": jsonNFT
          });
        } catch (error) {
          console.log(error)
      }
    }
  }
  return (
    <div className="main-container">
      <div className='container'>
        <div className='row title'>
          יצירת NFT
        </div>
        <div className="row main-section">
          <div className="col right-col">
            <div className='row input-row'>
              <label for="inputName" class="form-label text-mint">מה שם היצירה?</label>
              <input
                id="inputName"
                className='col input-mint'
                onChange={e => setName(e.target.value)}
                type='text'
                aria-describedby='input'
              ></input>
            </div>
            <div className='row input-row'>
              <label for="inputDescription" class="form-label text-mint">תאר לנו את היצירה בכמה מילים</label>

              <textarea
                id="inputDescription"
                className='col textarea-mint'
                onChange={e => setDescription(e.target.value)}
                type='text'
                aria-describedby='input'
              ></textarea>
            </div>
            {/* <div className='row input-row'>
              <span class='col text-mint'>Trait Type</span>
              <input
                className='col input-mint'
                onChange={e => setTrait(e.target.value)}
                type='text'
                aria-describedby='input'
              ></input>
              <span class='col text-mint'>Value</span>
              <input
                className='col input-mint'
                onChange={e => setTraitValue(e.target.value)}
                type='text'
                aria-describedby='input'
              ></input>
            </div> */}

          </div>
          <div className="col">
            <div className='row input-row'>
              <label for="inputFile" class="form-label text-mint">בחר קובץ להעלאה</label>
              <div {...getRootProps()} className="input-file">
                <input {...getInputProps()} id="inputFile" />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p className="drag-description">גרור את הקובץ לכאן או לחץ לבחירה</p>
                )}
              </div>
            </div>
          </div>

        </div>

        <image src={imagesrc ? imagesrc : null} />
        <div className='row input-row'>
          <button className={modeSwitch ? "col mode-switch off" : "col mode-switch on"} onClick={()=>setModeSwitch(0)}>
            <h3 className="title">הטבעה מיידית</h3>
            <p className="description">
העלאת הNFT לבלוקצ'יין ושיוכו לארנק הדיגיטלי
(תשלום עמלת גז מיידי)
            </p>
          </button>
          <button className={modeSwitch ? "col mode-switch on" : "col mode-switch off"} onClick={()=>setModeSwitch(1)}>
            <h3 className="title">יצירת מודעה ללא הטבעה</h3>
            <p className="description">
יצירת מודעת מכירה מבלי להעלות את הNFT לבלוקצ'יין
(ללא תשלום, אלא בעת המכירה)
            </p>
          </button>
        </div>
        <button type='submit' onClick={() => mintItem()} class='btn-submit'>
          צור NFT
        </button>
      </div>
    </div>
  )
}
