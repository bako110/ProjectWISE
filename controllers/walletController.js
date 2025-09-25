import Wallet from "../models/Wallet.js";

export const createWallet = async (req, res) => {
  try {
    // const { userId, balance, kind } = req.body;
    // if (balance == null || balance == undefined) {
    //   balance = 0; // Default balance if not provided
    // }
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "UserId est obligatoire" });
    }

    const wallet = new Wallet({
      userId,
      balance:0,
      kind:'standard'
    });

    await wallet.save();

    res.status(201).json({
      message: "Wallet créé avec succès",
      wallet
    });
  } catch (error) {
    console.error("Erreur lors de la création du wallet :", error);
    res.status(500).json({ error: error.message });
  }
}

export const addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.params;
    if (!userId || !amount) {
      return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    }
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }
    if ( amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    wallet.balance += parseInt(amount);
    await wallet.save();
    res.status(200).json({message: "Funds added successfully", wallet});
  } catch (error) {
    console.error("Erreur lors de l'ajout de fonds au wallet :", error);
    res.status(500).json({ error: error.message });
  }
}

export const getWalletByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }
    res.status(200).json(wallet);
  } catch (error) {
    console.error("Erreur lors de la récupération du wallet :", error);
    res.status(500).json({ error: error.message });
  }
}

export const getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find();
    if (wallets.length === 0) {
      return res.status(404).json({ message: 'No wallets found' });
    } 
    res.status(200).json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// export const chargeWallet = async (req, res) => {
//   try {
//     const { userId, amount } = req.body;

//     if (!userId || typeof amount !== 'number' || amount <= 0) {
//       return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
//     }

//     const wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       return res.status(404).json({ error: "Wallet not found for this user" });
//     }

//     wallet.balance += amount;
//     await wallet.save();

//     res.status(200).json({
//       message: "Wallet charged successfully",
//       wallet
//     });
//   } catch (error) {
//     console.error("Erreur lors du chargement du wallet :", error);
//     res.status(500).json({ error: error.message });
//   }
// }

// export const withdrawFromWallet = async (req, res) => {
//     try{
//     const { userId, amount } = req.body;
//     if (!userId || typeof amount !== 'number' || amount <= 0) {
//       return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
//     }
//     const wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       return res.status(404).json({ error: "Wallet not found for this user" });
//     }
//     if (wallet.balance < amount) {
//       return res.status(400).json({ error: "Insufficient balance" });
//     }   
//     wallet.balance -= amount;
//     await wallet.save();
//     res.status(200).json({
//       message: "Withdrawal successful",
//       wallet
//     });
//     } catch (error) {
//       console.error("Erreur lors du retrait du wallet :", error);
//       res.status(500).json({ error: error.message });
//     }
// }

