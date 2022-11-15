import React from "react";
import Certification from "./contracts/Certification.json";
import Web3 from "web3";
// import ReactDOM from 'react-dom/client';
// import { EthProvider } from "./contexts/EthContext";
// import Intro from "./components/Intro/";
// import Setup from "./components/Setup";
// import Demo from "./components/Demo";
// import Footer from "./components/Footer";
import "./App.css";

var Tx = require("ethereumjs-tx").Transaction

const rpcURL = "http://localhost:7545";
const web3 = new Web3(rpcURL);

const abi = Certification["abi"];
const contractAddress = "0xBD803C2e3039ddC07E0FC328f2d5c388d5B83A48";
const contract = new web3.eth.Contract(abi, contractAddress);

const account = "0xF495c4347E89BB8EaD344a66773681455bD7E756";
const pk = "a7b43b84df0be3d4e4f65a99f3b58088e3e25608a904c246b7078558048cdeb9";
const privateKey = Buffer.from(pk, "hex");

const ipfsAPI = require("ipfs-api");
const ipfs = ipfsAPI({
  host: "localhost",
  port: "5001",
  protocal: "http",
  EXPERIMENTAL: { pubsub: true}
});

let saveDataToIPFS = (reader) => {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer).then((response) => {
      // console.log(response);
      resolve(response[0].hash);
    }).catch((err) => {
      console.error(err);
      reject(err);
    })
  })
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchHash: null,
      dateID: null,
      data: null,
      isSuccess: false
    }

    this.getReader = this.getReader.bind(this);
    this.handleCreateCertification = this.handleCreateCertification.bind(this);
    this.handleCertificate = this.handleCertificate.bind(this);
  }

  componentDidMount() {
    // ipfs.swarm.peers(function(err, res) {
    //   if (err) {
    //     console.error("ipfs err", err);
    //   } else {
    //     console.log("ipfs res: ", res);
    //   }
    // });
  }

  getReader(fileid) {
    let file = document.getElementById(fileid).files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    return reader;
  }

  handleCreateCertification(event) {
    // first we upload the data to ipfs
    let reader = this.getReader("file");
    reader.onloadend = function(e) {
      saveDataToIPFS(reader).then((hash) => {
        console.log("IPFS HASH: ", hash);
        this.setState({
          searchHash: hash,
          data: reader.result
        }, () => {        // second we need to wait setState synchronize and then create transaction
          web3.eth.getTransactionCount(account, (err, txCount) => {
            let dataID = document.getElementById("dateID").value;
            let title = document.getElementById("title").value;
            // console.log("title: ", title);
            // build a write transaction
            const txObject = {
              nonce: web3.utils.toHex(txCount),
              gasLimit: web3.utils.toHex(800000),
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              to: contractAddress,
              data: contract.methods.createAbstract(dataID,
                                            this.state.searchHash,
                                            title, "xxx",
                                            web3.utils.utf8ToHex(this.state.data)
                                          ).encodeABI()
            };
            const tx = new Tx(txObject);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const raw = "0x" + serializedTx.toString("hex");
            web3.eth.sendSignedTransaction(raw, (err, txHash) => {
              if (err) {
                console.error("error: ", err);
              } else {
                console.log("txHash: ", txHash);
                console.log("create certification successfully!");
                this.setState({isSuccess: true});
              }
            })

          });
        });
      });
    }.bind(this);
  }


  handleCertificate(event) {
    let dataID = document.getElementById("certificateDateID").value;
    let reader = this.getReader("certificateFile");
    reader.onloadend = function(e) {
      contract.methods.certificate(dataID, web3.utils.utf8ToHex(reader.result)).call((err, val) => {
        if (err) {
          console.log("err: ", err);
        } else {
          console.log("return value: ", val);
        }
      });
    }.bind(this);

  }

  render() {
    return (
      <div className="App container">
        <div className="container box">

          <div className="">
            <span className="h5 text-primary">Smart Contract address: </span>
            <span>{contractAddress}</span>
          </div>

          <form className="rounded">
            <div className="mb-3 mt-3">
              <label htmlFor="file" className="form-label">Slect File:</label>
              <input type="file" className="form-control" id="file"  name="file" multiple="multiple"/>
            </div>
            <div className="mb-3 mt-3">
              <label htmlFor="dateID" className="form-label">Input DataID:</label>
              <input type="date" className="form-control" id="dateID" defaultValue="2000-01-01"/>
            </div>
            <div className="mb-3 mt-3">
              <label htmlFor="title" className="form-label">Input Title:</label>
              <input type="text" id="title" className="form-control" id="title"/>
            </div>
            <button type="button" className="btn btn-primary float-end" onClick={this.handleCreateCertification}>Create Certification</button>
          </form>

          <form className="rounded certificate">
            <div className="mb-3 mt-3">
              <label htmlFor="certificateFile" className="form-labSel">Slect Certification File:</label>
              <input type="file" className="form-control" id="certificateFile"  multiple="multiple"/>
            </div>
            <div className="mb-3 mt-3">
              <label htmlFor="certificateDateID" className="form-label">Slect Certification File:</label>
              <input type="date" className="form-control" id="certificateDateID"  defaultValue="2000-01-01"/>
            </div>
              <button type="button" className="btn btn-primary float-end" onClick={this.handleCertificate}>Certificate</button>
          </form>



        </div>
      </div>
    );
  }
}


// function App() {
//   return (
//     <EthProvider>
//       <div id="App" >
//         <div className="container">
//           <Intro />
//           <hr />
//           <Setup />
//           <hr />
//           <Demo />
//           <hr />
//           <Footer />
//         </div>
//       </div>
//     </EthProvider>
//   );
// }

export default App;
