const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const csv = require('csv-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const app = express();
  app.use(cors());

  const results = [];

  fs.createReadStream(path.join(__dirname, '..', 'data', 'bebidas.csv'))
    .pipe(csv())
    .on('data', async (data) => {
      results.push(data);
      await prisma.bebida.create({
        data: {
          nome: data.NOME,
          preco: parseFloat(data.PRECO),
          quantidade: parseInt(data.QUANTIDADE),
          descricao: data.DESCRICAO || null,
          total_vendas: parseFloat(data.TOTAL_VENDAS) || null,
          quantidade_vendas: parseInt(data.QUANTIDADE_VENDAS) || null,
        },
      });
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    });

  app.post('/bebidas', async (req, res) => {
    try {
      const bebida = await prisma.bebida.create({
        data: {
          nome: req.body.nome,
          preco: req.body.preco,
          quantidade: req.body.quantidade,
          descricao: req.body.descricao || null,
          total_vendas: req.body.total_vendas || null,
          quantidade_vendas: req.body.quantidade_vendas || null,
        },
      });
      res.json(bebida);
    } catch (e) {
      console.error(e);
      res.status(500).send('Erro ao criar bebida');
    }
  });

  app.get('/bebidas', async (req, res) => {
    const bebidas = await prisma.bebida.findMany();
    res.json(bebidas);
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
