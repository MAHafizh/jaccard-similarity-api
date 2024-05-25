const { json } = require("express");
const db = require("../database/firebaseConfig.js");

const getDiagnosa = async (req, res) => {
  let highSimilarity = 0;
  let highSimilarityCaseId = null;

  try {
    const { gejala } = req.body;
    const caseName = req.body.name;

    if(gejala.length < 3) {
      return res.status(400).json({msg: "Gejala kurang dari 3"});
    } 

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

      if (similarity > highSimilarity) {
        highSimilarity = similarity;
        highSimilarityCaseId = caseId;
      }
    });
    if (highSimilarityCaseId) {
      const penyakitId = dataKasus[highSimilarityCaseId].penyakit;
      const penyakitName = penyakit[penyakitId];
      const result = {
        id: highSimilarityCaseId,
        penyakit: (`${penyakitName}(${penyakitId})`),
        similarity: highSimilarity.toFixed(3),
      };

      if (highSimilarity >= 0.75) {
        await retainCase({gejala, caseName, penyakitId})
      }

      res.json(result);
    } else {
      res.status(404).json({ msg: "Kasus yang mirip tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.error(error);
  }
};

const deleteDataKasusbyId = async (req, res) => {
  try {
    const {caseId} = req.params;
    await db.ref(`data_kasus/${caseId}`).remove();
    res.status(200).json({msg: `Data dengan ID ${caseId} sudah dihapus`});
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.error(error);
  }
}

const jaccardSimilarity = (x, y) => {
  const irisan = x.filter((value) => y.includes(value)).length;
  const gabungan = new Set([...x, ...y]).size;
  const result = irisan / gabungan;
  console.log('irisan: ',irisan)
  console.log('gabungan: ',gabungan)
  return result;
};

const retainCase = async (newCase) => {
  try {
    const snapshotCase = await db.ref("data_kasus").once("value");
    const dataKasus = snapshotCase.val();

    const isCaseExist = Object.values(dataKasus).some(
      (existCase) => JSON.stringify(existCase.gejala.sort()) === JSON.stringify(newCase.gejala.sort())
    );

    if(isCaseExist) {
      console.log("Kombinasi Gejala yang sama sudah ada dalam database");
      return;
    }

    const caseId = Object.keys(dataKasus);
    const lastId = caseId[caseId.length - 1];
    const newIdnumber = parseInt(lastId.substring(2)) + 1;
    const newid =  `BK${newIdnumber.toString().padStart(3, '0')}`;

    await db.ref(`data_kasus/${newid}`).set({
      gejala: newCase.gejala,
      name: newCase.caseName,
      penyakit: newCase.penyakitId
    });
    console.log("Kasus baru telah ditambah ke database");
  } catch (error) {
    console.error(error);
  }
}

module.exports = { getDiagnosa, deleteDataKasusbyId };