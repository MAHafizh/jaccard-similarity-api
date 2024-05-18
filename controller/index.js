const db = require("../database/firebaseConfig.js");

const getDiagnosa = async (req, res) => {
    
  let highSim = 0;
  let mostSim = null;

  try {
    const { gejala } = req.body;
    const snapshotCase = await db.ref("data_kasus").once("value");
    const dataKasus = snapshotCase.val();
    const snapshotPenyakit = await db.ref("penyakit").once("value");
    const penyakit = snapshotPenyakit.val();
    console.log("Gejala: ", gejala);
    console.log("data kasus: ", dataKasus);

    Object.keys(dataKasus).forEach((caseId) => {
      const caseData = dataKasus[caseId];
      const similarity = jaccardSimilarity(gejala, caseData.gejala);
      console.log(`Similarity for ${caseId}:`, similarity);

      if (similarity > highSim) {
        highSim = similarity;
        mostSim = caseId;
      }
    });
    if (mostSim) {
      const penyakitId = dataKasus[mostSim].penyakit;
      const penyakitName = penyakit[penyakitId];
      const result = {
        id: mostSim,
        name: dataKasus[mostSim].name,
        penyakit: (`${penyakitName}(${penyakitId})`),
        similarity: highSim.toFixed(3),
      };
      res.json(result);
    } else {
      res.status(404).json({ msg: "Kasus yang mirip tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.error(error);
  }
};

const jaccardSimilarity = (x, y) => {
  const irisan = x.filter((value) => y.includes(value)).length;
  const gabungan = new Set([...x, ...y]).size;
  const result = irisan / gabungan;
  return result;
};

module.exports = { getDiagnosa };
