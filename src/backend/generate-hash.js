const bcrypt = require('bcrypt');

const senhaPlana = 'admin';
const saltRounds = 10;

async function gerarHash() {
    const hash = await bcrypt.hash(senhaPlana, saltRounds);

    console.log('Senha Original:', senhaPlana);
    console.log('Hash Gerado:', hash);
}

gerarHash();
