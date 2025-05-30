import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.qRCodeAccess.deleteMany();
  await prisma.validation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.product.deleteMany();
  await prisma.laboratory.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cpgvalidation.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  const brandUser = await prisma.user.create({
    data: {
      email: 'marca@exemplo.com',
      password: hashedPassword,
      name: 'Marca Exemplo',
      role: 'BRAND',
    },
  });

  console.log('✅ Usuários criados');

  // Criar laboratório
  const laboratory = await prisma.laboratory.create({
    data: {
      name: 'Laboratório de Análises Nutricionais LTDA',
      accreditation: 'ISO/IEC 17025:2017',
      email: 'contato@labnutri.com.br',
      phone: '+55 11 1234-5678',
      address: 'Rua das Análises, 123 - São Paulo, SP',
      isActive: true,
    },
  });

  console.log('✅ Laboratório criado');

  // Criar produto
  const product1 = await prisma.product.create({
    data: {
      name: 'Whey Protein Premium',
      brand: 'FitNutri',
      category: 'Suplementos',
      description: 'Whey protein isolado com alta concentração de proteínas',
      sku: 'FN-WP-001',
      batchNumber: 'L2024001',
      nutritionalInfo: {
        serving_size: '30g',
        calories: 120,
        protein: '25g',
        carbs: '2g',
        fat: '1g',
        sodium: '50mg'
      },
      claims: ['Fonte de Proteína', 'Sem Lactose', 'Sem Glúten'],
      imageUrl: 'https://example.com/whey-protein.jpg',
      qrCode: 'QR001-WHEY-PROTEIN',
      status: 'VALIDATED',
      userId: brandUser.id,
    },
  });

  console.log('✅ Produto criado');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('🔑 Credenciais: admin@cpgvalidation.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
