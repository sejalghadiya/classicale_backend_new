import bcrypt from "bcrypt";
async function generatePasswordHash(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
}

generatePasswordHash("User@123");
