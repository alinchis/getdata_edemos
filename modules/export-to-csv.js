// get metadata from BAC server and save it in JSON files

// import libraries
const fs = require('fs-extra');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// Download & Process Exams Centers
function extractData(year, month, ecArray, stArray) {
    // refactor exams centers array, from 2 levels to 1 level
    const newEcArray = ecArray.map((ecItem) => {
        return ecItem.listaLicee.map((hsItem) => {
            return {
                denumire: hsItem.denumire,
                codSirues: hsItem.codSirues,
                localitate: hsItem.localitate
                    .replace('  ', ' ')
                    .replace('BUCURESTI SECTORUL', 'SECTORUL'),
                judetCod: ecItem.judet_cod,
                judetNume: ecItem.judet_nume
                    .replace('BUCURESTI', 'MUNICIPIUL BUCURESTI'),
                centruExaminareDenumire: ecItem.denumire,
                centruExaminareCodSirues: ecItem.codSirues,
                centruExaminareLocalitate: ecItem.localitate,
                ultimaActualizare: ecItem.ultima_actualizare,
            }
        });
    }).flat();
    // add missing school
    if (year === 2018 && month === 'july') newEcArray.push({
        denumire: 'LICEUL TEHNOLOGIC DUMBRAVIOARA',
        codSirues: '5985413',
        localitate: 'DUMBRAVIOARA',
        judetCod: 'MS',
        judetNume: 'MURES',
        centruExaminareDenumire: '',
        centruExaminareCodSirues: '',
        centruExaminareLocalitate: '',
        ultimaActualizare: newEcArray[0].ultimaActualizare,
    })

    // build return array
    const returnArr = stArray.map((student, index) => {
        // find corresponding item from the exams centers array
        // console.log(newEcArray);
        const unitateDetalii = newEcArray.filter(item => item.denumire === student.unitateInvatamant && item.judetCod === student.unitateJudet);
        if(unitateDetalii.length === 0) throw `ERROR \'${student.unitateJudet}\':\'${student.unitateInvatamant}\' NOT found!!!`;

        // return new row items
        return [
            student.an,
            month === 'july' ? 'iulie' : 'septembrie',
            unitateDetalii[0].codSirues,
            student.unitateInvatamant,
            '', // siruta
            unitateDetalii[0].localitate,
            unitateDetalii[0].localitate
                .replace('-', ' '),
            '', // siruta_uat
            '', // uat
            student.unitateJudet,
            '', // judet_id
            unitateDetalii[0].judetNume,
            unitateDetalii[0].judetNume
                .replace('-', ' '),
            unitateDetalii[0].centruExaminareCodSirues,
            unitateDetalii[0].centruExaminareDenumire,
            unitateDetalii[0].ultimaActualizare,
            student.index,
            student.numeLung,
            student.pozitiePeJudet,
            student.pozitiePeTara,
            student.promotieAnterioara,
            student.formaInvatamant,
            student.specializare,
            student.llrCompetente,
            student.llrScris,
            student.llrContestatie,
            student.llrNotaFinala,
            student.llm,
            student.llmCompetente,
            student.llmScris,
            student.llmContestatie,
            student.llmNotaFinala,
            student.lm,
            student.lmNota,
            student.do,
            student.doNota,
            student.doContestatie,
            student.doNotaFinala,
            student.da,
            student.daNota,
            student.daContestatie,
            student.daNotaFinala,
            student.competenteDigitale,
            student.media,
            student.rezultatFinal,
        ].join('#');
    });

    // create header row
    const header_row = [
        'an',
        'luna',
        'cod_sirues',
        'unitate_invatamant',
        'siruta',
        'localitate_en',
        'localitate_en2',
        'siruta_uat',
        'uat_en',
        'judet_cod',
        'judet_id',
        'judet_en',
        'judet_en2',
        'centru_examinare_cod_sirues',
        'centru_examinare',
        'ultima_actualizare',
        'index_alfabetic',
        'elev',
        'pozitie_judet',
        'pozitie_tara',
        'promotie_anterioara',
        'forma_invatamant',
        'specializare',
        'llr_competente',
        'llr_scris',
        'llr_contestatie',
        'llr_nota_finala',
        'llm',
        'llm_competente',
        'llm_scris',
        'llm_contestatie',
        'llm_nota_finala',
        'lm',
        'lm_nota',
        'do',
        'do_nota',
        'do_contestatie',
        'do_nota_finala',
        'da',
        'da_nota',
        'da_contestatie',
        'da_nota_finala',
        'competente_digitale',
        'media',
        'rezultat_final',
    ].join('#');
    // add header row to array
    returnArr.unshift(header_row);

    // return the new array
    console.log('@extractData return new array');
    // console.log(returnArr);
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (year, month, ecFilePath, stFilePath, saveFile) => {
    try {
        console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Export JSON to CSV`);

        // load files
        const ecArr = JSON.parse(fs.readFileSync(ecFilePath, 'utf8'));
        const stArr = JSON.parse(fs.readFileSync(stFilePath, 'utf8'));

        // process data into new array
        const returnArray = extractData(year, month, ecArr, stArr);

        console.log('extractData done !!!!!!!!!!!!!!!!!!!!!!!!!!!');
        // save data to file
        fs.writeFileSync(saveFile, returnArray.join('\n'), 'utf8', () => console.log(`@BAC::File ${saveFile} closed!`));
        console.log('@BAC:: Exams Centers Info file write Done!');
    } catch(err) {
        console.error(err);
    }

}
