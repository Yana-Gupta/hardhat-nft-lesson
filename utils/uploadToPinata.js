const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

require("dotenv").config

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET

const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath)
  const files = fs.readdirSync(fullImagesPath)

  let responses = []

  console.log("Uploading to IPFS...")

  for (fileIndex in files) {
    console.log(`Uploading ${fileIndex} index....`)
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    )
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    }

    await pinata
      .pinFileToIPFS(readableStreamForFile, options)
      .then((res) => {
        responses.push(res)
      })
      .catch((e) =>
        console.log(`Error uploading ${files[file]} to the pinata: `, e)
      )
  }
  return { responses, files }
}

async function storeTokenURIMetadata(metadData) {
  let ans
  console.log(`Uploading ${metadData.name} to IPFS...`)
  const option = {
    pinataMetadata: {
      name: metadData.name,
    },
  }

  await pinata
    .pinJSONToIPFS(metadData, option)
    .then((response) => {
      ans = response
    })
    .catch((e) =>
      console.log(`Error uploading ${metadData.name}} to the IPFS`, e)
    )
    return ans
}

module.exports = { storeImages, storeTokenURIMetadata }
