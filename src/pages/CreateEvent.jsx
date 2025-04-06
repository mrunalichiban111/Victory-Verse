

import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import bgImage from "../assets/event-bg.jpg";
import { WalletContext } from "../context/WalletContext";
import { ethers } from "ethers";
import EventManagerABI from "../contracts/EventManagerABI.json";
import { uploadToPinata } from "../utils/UploadToPinata"; // Your file upload function
import { createAndUploadMetadata } from "../utils/UploadMetadataToPinata";

const CreateEvent = () => {
    const { walletAddress } = useContext(WalletContext);
    const [bannerFile, setBannerFile] = useState(null);
    const contractAddress = "0xCb27F705662c98F0659f620E3ED73f571b021228";
    const [metadataCID, setMetadataCID] = useState("");
    const [image, setImage] = useState("");

    const [event, setEvent] = useState({
        name: '',
        logo: '', // this will store the metadata URI later
        WinnerTokenAmount: '',
        FanTokenAmount: '',
        FanTokenPrice: '',
        description: '',
    });

    const handleChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setBannerFile(e.target.files[0]);
    };

    // Converts ipfs:// CID to a gateway URL (you can choose a gateway of your choice)
    const convertToGatewayUrl = (ipfsUri) => {
        // Example: ipfs://CID becomes https://ipfs.io/ipfs/CID
        return ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
    };
  

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        if (!walletAddress) {
          alert("Please connect your wallet first!");
          return;
        }
      
        try {
            // Upload the banner file and retrieve its URL
            const fileUrl = await uploadToPinata(bannerFile);
            console.log("File URL:", fileUrl);

            // Create metadata JSON with event name, description, and file URL
            const cid = await createAndUploadMetadata(event.name, event.description, fileUrl);
            setMetadataCID(cid);
            console.log("Metadata CID:", cid);

            // Use the metadata URI (you can form it as ipfs://CID or use a gateway URL)
            const metadataURI = `ipfs://${cid}`;

            const _provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await _provider.getSigner();
            const contract = new ethers.Contract(contractAddress, EventManagerABI.abi, signer);
      
            const tx = await contract.createEvent(
                event.name,
                ethers.parseEther(event.WinnerTokenAmount),
                ethers.parseEther(event.FanTokenAmount),
                ethers.parseEther(event.FanTokenPrice, "wei"),
                metadataURI,
                event.description
            );
        
            await tx.wait();
            alert("Event created successfully!");
        } catch (error) {
          console.error("Error creating event:", error);
          alert("Transaction failed. See console.");
        }
    };      

    return (
        <>
            <Navbar />

            <div
                className="relative min-h-screen bg-cover bg-center bg-no-repeat text-white flex items-center justify-end"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute left-12 max-w-xl text-left space-y-6">
                     <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl font-bold text-cyan-400 leading-tight drop-shadow-lg"
                    >
                        Welcome to VictoryVerse
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg text-gray-300 max-w-md backdrop-blur-sm bg-black bg-opacity-30 p-4 rounded-lg border border-cyan-800 shadow-md"
                    >
                        A decentralized platform where events meet innovation. Create, mint, and showcase your event NFTs in the metaverse. Own your moment. Shape your legacy.
                    </motion.p>
                </div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="backdrop-blur-md bg-black bg-opacity-50 border border-purple-700 rounded-2xl shadow-2xl px-8 py-10 w-full max-w-xl space-y-6 mr-12 mt-20"
                >
                    <h2 className="text-3xl font-semibold text-center text-purple-400">Create New Event</h2>

                    <input
                        type="text"
                        name="name"
                        placeholder="Event Name"
                        value={event.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black bg-opacity-30 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:shadow-lg transition-all duration-300"
                        required
                    />

                    <input
                        type="number"
                        name="WinnerTokenAmount"
                        placeholder="Winner Token Amount"
                        value={event.WinnerTokenAmount}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black bg-opacity-30 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    <input
                        type="number"
                        name="FanTokenAmount"
                        placeholder="Fan Token Amount"
                        value={event.FanTokenAmount}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black bg-opacity-30 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    <input
                        type="number"
                        name="FanTokenPrice"
                        placeholder="Fan Token Price"
                        value={event.FanTokenPrice}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black bg-opacity-30 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Event Description"
                        value={event.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 bg-black bg-opacity-30 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    ></textarea>

                    <div className='flex justify-between items-center'>
                        <label className="block text-sm text-gray-400 mb-1">Upload Banner (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400 bg-black bg-opacity-30 border border-gray-600 rounded-lg p-2"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 transition rounded-lg font-semibold shadow-md"
                    >
                        Create Event
                    </button>
                </motion.form>
            </div>
        </>
    );
};

export default CreateEvent;
