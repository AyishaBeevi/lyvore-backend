import bcrypt from 'bcryptjs'; 
async function run() {
  const plainPassword = "Admin@123"; 
  const hashed = await bcrypt.hash(plainPassword, 10);
  console.log("Hashed password:", hashed);
}

run();