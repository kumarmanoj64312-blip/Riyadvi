/**
 * Prints a bcrypt hash for ADMIN_PASSWORD_HASH — the plain password is never stored.
 *   npm run hash-password -- "my strong password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "<password of at least 10 characters>"');
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));
